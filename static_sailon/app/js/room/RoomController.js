'use strict';


function RoomController($scope, userModel, socket, $location, tabsModel, roomGlobal, roomModel) {
    $scope.current = roomModel.getCurrentDoc();
    $scope.$on('$destroy', function() {
        roomModel.leaveRoom($scope.current);
    })

    socket.onScope($scope, {
        'run': function (data){
            $scope.current.locks.run = true;

            //open the console and chat-windowl(need?)
            if (! $scope.show_console)
                $scope.toggleConsole();

            if (! $scope.chat_show)
                $scope.toggleChat();

            //chat系统消息 日期
            //某某 运行程序
            var time = new Date();
            var msg = {
                'name': 'system',
                'type': 'system',
                'content': userModel.user.name + ' runs the program',
                'time': time.toTimeString().substr(0, 8)
            }
            $scope.current.chat.push(msg);

            $scope.current.locks.operation = false;

            
        },

        'running': function (data) {
            if (! $scope.current.locks.debug)
                return;
            $scope.current.waiting = false;
            $scope.runToLine(-1);
            //debugandwait --> 禁用

        },
        'waiting': function (data) {
            if (! $scope.current.locks.debug)
                return;
            $scope.current.waiting = true;
            if (typeof data.line == 'number'){
                $scope.runToLine(data.line - 1);
            } else {
                $scope.runToLine(-1);
            }

            /*
            for(var k in data.exprs) {
                expressionlist.setValue(k, data.exprs[k]);
            }
            */
            //绑定调试按钮－－》解除禁用属性
        },

        'exit': function (data){
            $scope.current.locks.operation = false;
            if(data.err.code !== undefined){
                var time = new Date();
                var msg = {
                    'name': 'system',
                    'type': 'system',
                    'content': 'program finish with ' + data.err.code,
                    'time': time.toTimeString().substr(0, 8) 
                }
                $scope.current.chat.push(msg);
                $scope.consoleState = "<finish>";

            } else{
                var time = new Date();
                var msg = {
                    'name': 'system',
                    'type': 'system',
                    'content': 'program killed by '+ data.err.signal,
                    'time': time.toTimeString().substr(0, 8) 
                }

                $scope.current.chat.push(msg);
                $scope.consoleState = "<killed>";
            }

            //editor-run 激活一个小图标 icon-play
            if ($scope.current.locks.run)
                $scope.current.locks.run = false;

            if ($scope.current.locks.debug){  

                $scope.current.editor.setValue($scope.current.oldText);
                $scope.removeAllBreakpoints();
                $scope.initBreakpoints($scope.current.oldText);

                var editordoc = $scope.current.editor.getDoc();
                var hist = editordoc.getHistory();
                hist.done.pop();
                editordoc.setHistory(hist);

                $scope.current.editor.setOption('readOnly', false);   
                if($scope.current.q.length > 0){
                    socket.emit('change', q[0]);
                }

                $scope.runToLine(-1);
                /*??
                for(var k in expressionlist.elements) {
                    expressionlist.setValue(expressionlist.elements[k].expression, null);
                }
                */
                $scope.current.locks.debug = false;
            }
        },

        'debug': function (data){
            $scope.current.locks.debug = true;

            $scope.editor.setOption('readOnly', true);
        
             //open the console and chat-windowl(need?)
            if (! $scope.show_console)
                $scope.toggleConsole();

            if (! $scope.chat_show)
                $scope.toggleChat();

            $scope.current.oldText = $scope.current.editor.getValue();
            $scope.current.oldBps = $scope.current.bps;
            $scope.current.editor.setValue(data.text);
            $scope.removeAllBreakpoints();
            $scope.initBreakpoints(data.bps);
            var hist = $scope.current.editor.getDoc().getHistory();
            hist.done.pop();
            $scope.current.editor.getDoc().setHistory(hist);
            $scope.current.locks.operation = false;

        },

        'stdin': function (data){
            $scope.current.consoleOutput.push({type:'stdin', content: data.data});
        },

        'stdout': function (data) {
            $scope.current.consoleOutput.push({type:'stdout', content: data.data});
        },

        'stderr':function (data) {
            $scope.current.consoleOutput.push({type:'stderr', content: data.data});
        },


        

    });
       
    $scope.changePath = tabsModel.changePath;
//	$scope.currentTab = {'path': ["bin","das","Dadi.cpp"]};
    //$scope.currentTab = $scope.current.doc.path;
	$scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        indentUnit: 4,
		indentWithTabs: true,
        value: $scope.current.data.text,
        extraKeys: {
            "Esc": function(cm) {
                if (roomGlobal.isFullScreen(cm)) $scope.setFullScreen(false);
            },
            "Ctrl-S": function(cm) {
                roomModel.saveevent($scope.current, cm);
            },
        },
        onLoad : function(cm){
			// Editor part
		    $scope.current.editor = cm;
            $scope.editor = cm;
            roomModel.registerEditorEvent($scope.current);
		    var _doc = cm.getDoc();

		    cm.focus();

		    // Options
		    CodeMirror.modeURL = "/lib/codemirror/mode/%N/%N.js";

        
                    if (roomGlobal.languagemap[$scope.current.data.type]){
                        if (roomGlobal.modemap[$scope.current.data.type])
                            $scope.editor.setOption('mode', roomGlobal.modemap[$scope.current.data.type]);
                        else
                            $scope.editor.setOption('mode', roomGlobal.languagemap[$scope.current.data.type]);

                        CodeMirror.autoLoadMode(cm, roomGlobal.languagemap[$scope.current.data.type]);
                    } else{
                        $scope.editor.setOption('mode', 'text/plain');
                        CodeMirror.autoLoadMode($scope.editor, '');
                    }

                    if ($scope.current.lock.debug)
                        $scope.editor.setOption('readOnly', true);

   					//

				    // Events
				    cm.on("gutterClick", function(cm, n) {
                        $scope.gutterclick(cm, n);
                    });
				},
		gutters: ["runat", "CodeMirror-linenumbers", "breakpoints"],
    };

    $scope.chat_show = false;
    $scope.editor_width = 'span12'; 
    $scope.show_console = false;

   

    $scope.toggleConsole = function()
    {
    	if($scope.show_console == false)
    	{
    		$scope.editor.setSize('',560-165);
    	}
    	else
    	{
    		$scope.editor.setSize('',560);
    	}
        $scope.show_console = !$scope.show_console;
    }

    $scope.toggleChat = function()
    {
        $scope.chat_show = !$scope.chat_show;
        if($scope.editor_width=='span12')
        {
            $scope.editor_width = 'span9';
        }
        else
        {
            $scope.editor_width = 'span12';
        }
    }

    var tmpH, tmpW;
    $scope.setFullScreen = function(full)
    {
        var wrap = $scope.editor.getWrapperElement();
        if (full) 
        {
            wrap.className += " CodeMirror-fullscreen";
            tmpH = wrap.style.height;
            tmpW = wrap.style.width;
            wrap.style.height = roomGlobal.winHeight() + "px";
            wrap.style.width = roomGlobal.winWidth() + "px";
            wrap.style.margin = "0px 0px 0px -240px";
            document.documentElement.style.overflow = "hidden";
        }
        else
        {
            wrap.className = wrap.className.replace(" CodeMirror-fullscreen", "");
            wrap.style.height = tmpH;
            wrap.style.width = tmpW;
            wrap.style.margin = "0px";
            document.documentElement.style.overflow = "";
        }
        $scope.editor.refresh();
        $scope.editor.focus();
    }
    
    // ================================
    // run 
     $scope.runFn = function (){

        if (! $scope.current.runEnabled() || $scope.current.lock.operation) 
           return;
        
        $scope.current.lock.operation = true;

        if ($scope.current.lock.run){
            socket.emit('kill');
        } else {
            $scope.current.consoleOutput = [];
            $scope.consoleState = "<running>";
            socket.emit('run',$scope.current.data);
        }

        $scope.consoleInput = "";
    }
   
    //-------------------------------------------------------------------
    //console
    $scope.vars = [{'name':'n','showVar':true,'focus':false,'value':'12'},
                {'name':'m','showVar':true,'focus':false,'value':'12'}];

    $scope.rename  = function(n)
    {
        $scope.vars[n].showVar = false;
        $scope.vars[n].focus = true;
    }

    $scope.submitVar = function(n)
    {
        $scope.vars[n].showVar = true;
        $scope.vars[n].focus = false;
        if($scope.vars[n].name == "")
        {
            $scope.vars.splice(n,1);
        }
    }

    $scope.addVar = function(){
        $scope.vars.push({'name':'','showVar':false,'focus':true,'value':'Dadi'});
    }

    $scope.consoleInputFn = function() {
        if ($scope.current.locks.debug || $scope.current.locks.run){
            socket.emit('stdin', {
                data: $scope.consoleInput + "\n"
            })
        } else{
            $scope.current.consoleOutput.push({
                type:'stdin', 
                content: $scope.consoleInput + "\n"
            });
        }
        $scope.consoleInput = "";
    }
    //-------------------------------------------------------------------
    $scope.debugFn = function(){

        if (! $scope.current.debugEnabled() || $scope.current.lock.operation )
            return;
        $scope.current.lock.operation = true;
        if ($scope.current.lock.debug){
            socket.emit('kill')
        } else{
            socket.emit('debug', $scope.current.data);
        }
    }

    $scope.debugStepFn = function() {
        if ($scope.current.lock.debug && $scope.current.waiting){
            socket.emit('step', {

            });
        }
    }

    $scope.debugNextFn = function() {
        if ($scope.current.lock.debug && $scope.current.waiting){
            socket.emit('next', {

            })
        }
    }

    $scope.debugFinishFn = function() {
        if ($scope.current.ock.debug && $scope.current.waiting){
            socket.emit('finish', {

            })
        }
    }
    $scope.debugContinueFn = function(){
        if ($scope.current.lock.debug && $scope.current.waiting){
            socket.emit('resume', {

            })
        }
    }

    // Debug 
   // Breakpoints
   $scope.runToLine = function(n) {
        if($scope.runningLine >= 0) {
            $scope.current.editor.removeLineClass($scope.current.runningLine, '*', 'running');
            $scope.current.editor.setGutterMarker($scope.current.runningLine, 'runat', null);
        }
        if(n >= 0) {
            $scope.current.editor.addLineClass(n, '*', 'running');
            $scope.current.editor.setGutterMarker(n, 'runat', 
                angular.element('<div><img src="images/arrow.png" width="16" height="16" style="min-width:16px;min-width:16px;" /></div>')[0]);
            $scope.current.editor.scrollIntoView({line:n, ch:0});
        }
        $scope.current.runningLine = n;
    }

    $scope.removeAllBreakpoints = function() {
        for (var i = 0; i < $scope.current.bps.length; i++){
            if ($scope.current.bps[i] == "1"){
                var info = $scope.current.editor.lineInfo(i);
                if (info.gutterMarkers && info.gutterMarkers["breakpoints"]) {
                    $scope.current.editor.setGutterMarker(i, 'breakpoints', null);
                }
            }
        }
        $scope.current.bps.replace("1", "0");
    }

    $scope.initBreakpoints = function(bpsstr) {
        $scope.current.bps = bpsstr;
        for (var i = bpsstr.length; i < $scope.current.editor.lineCount(); i++){
            $scope.current.bps += "0";
        }
        for (var i = 0; i < $scope.current.bps.length; i++){
            if ($scope.current.bps[i] == "1"){
                
                var element = angular.element('<div><img src="images/breakpoint.png" /></div>')[0];
                $scope.current.editor.setGutterMarker(i, 'breakpoints', element);

            }
        }
    }
    
    $scope.gutterclick = function(cm, n)
    {
        var info = cm.lineInfo(n);
        if (info.gutterMarkers && info.gutterMarkers["breakpoints"]) 
        {
            cm.setGutterMarker(n, 'breakpoints', null);
        }
        else
        {
            var element = angular.element('<div><img src="img/breakpoint.png" /></div>')[0];
            cm.setGutterMarker(n, 'breakpoints', element);
        }
    }

    //expression list

}