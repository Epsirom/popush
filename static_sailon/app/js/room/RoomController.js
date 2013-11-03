'use strict';


function RoomController($scope, userModel, socket, $location, tabsModel, roomGlobal, roomModel) {
    $scope.current = tabsModel.getCurrent();
    $scope.$on('$destroy', function() {
        roomModel.leaveRoom($scope.current.room);
    })

    socket.onScope($scope, {
        'run': function (data){
            $scope.current.room.locks.run = true;

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
            $scope.current.room.chat.push(msg);

            $scope.current.room.locks.operation = false;

            
        },

        'running': function (data) {
            if (! $scope.current.room.locks.debug)
                return;
            $scope.current.room.waiting = false;
            $scope.runToLine(-1);
            //debugandwait --> 禁用

        },
        'waiting': function (data) {
            if (! $scope.current.room.locks.debug)
                return;
            $scope.current.room.waiting = true;
            if (typeof data.line == 'number'){
                $scope.runToLine(data.line - 1);
            } else {
                $scope.runToLine(-1);
            }

            for (var i = 0; i < $scope.current.expressionList.length; i ++){
                var expr = $scope.current.expressionList[i].expr;
                if (expr in data.exprs){
                    $scope.current.expressionList[i].value = data.exprs[k];
                } else{
                    $scope.current.expressionList[i].type = 'err';
                    $scope.current.expressionList[i].value = 'undefined';
                }
            }
        },

        'exit': function (data){
            $scope.current.room.locks.operation = false;
            if(data.err.code !== undefined){
                var time = new Date();
                var msg = {
                    'name': 'system',
                    'type': 'system',
                    'content': 'program finish with ' + data.err.code,
                    'time': time.toTimeString().substr(0, 8) 
                }
                $scope.current.room.chat.push(msg);
                $scope.consoleState = "<finish>";

            } else{
                var time = new Date();
                var msg = {
                    'name': 'system',
                    'type': 'system',
                    'content': 'program killed by '+ data.err.signal,
                    'time': time.toTimeString().substr(0, 8) 
                }

                $scope.current.room.chat.push(msg);
                $scope.consoleState = "<killed>";
            }

            //editor-run 激活一个小图标 icon-play
            if ($scope.current.room.locks.run)
                $scope.current.room.locks.run = false;

            if ($scope.current.room.locks.debug){  

                $scope.current.editor.setValue($scope.current.room.oldText);
                $scope.removeAllBreakpoints();
                $scope.initBreakpoints($scope.current.room.oldText);

                var editordoc = $scope.current.room.editor.getDoc();
                var hist = editordoc.getHistory();
                hist.done.pop();
                editordoc.setHistory(hist);

                $scope.current.room.editor.setOption('readOnly', false);   
                if($scope.current.room.q.length > 0){
                    socket.emit('change', q[0]);
                }

                $scope.runToLine(-1);
                
                for (var i = 0; i < $scope.current.expressionList.length; i ++){
                    $scope.current.expressionList[i].type = 'err';
                    $scope.current.expressionList[i].value = 'undefined';
                }
                $scope.current.room.locks.debug = false;
            }
        },

        'debug': function (data){
            $scope.current.room.locks.debug = true;

            $scope.editor.setOption('readOnly', true);
        
             //open the console and chat-windowl(need?)
            if (! $scope.show_console)
                $scope.toggleConsole();

            if (! $scope.chat_show)
                $scope.toggleChat();

            $scope.current.room.oldText = $scope.current.room.editor.getValue();
            $scope.current.room.oldBps = $scope.current.room.bps;
            $scope.current.room.editor.setValue(data.text);
            $scope.removeAllBreakpoints();
            $scope.initBreakpoints(data.bps);
            var hist = $scope.current.room.editor.getDoc().getHistory();
            hist.done.pop();
            $scope.current.room.editor.getDoc().setHistory(hist);
            $scope.current.room.locks.operation = false;

        },

        'stdin': function (data){
            $scope.current.room.consoleOutput.push({type:'stdin', content: data.data});
        },

        'stdout': function (data) {
            $scope.current.room.consoleOutput.push({type:'stdout', content: data.data});
        },

        'stderr':function (data) {
            $scope.current.room.consoleOutput.push({type:'stderr', content: data.data});
        },

        'add-expr':function (data){
            console.log('add' + data.expr + '$' + data.val);
            if (data.expr){
                var i;
                for (i = $scope.current.expressionList.length - 1; i >= 0; i --)
                    if (data.expr == $scope.current.expressionList[i].expr)
                        break;
                if (i < 0)
                    return;
                if (data.val != null)
                    $scope.current.expressionList[i].value = data.val;
                else
                {   
                    $scope.current.expressionList[i].value = 'undefined';
                    $scope.current.expressionList[i].type = 'err';
                }
            }
        },

        'rm-expr': function(data){
            console.log('rm' + data.expr + '#');
            /*
             var i;
            for (i = $scope.current.expressionList.length - 1; i >= 0; i --)
                if (data.expr == $scope.current.expressionList[i])
                    break;
            if (i < 0)
                return;
            $scope.current.expressionList.splice(n, 1);  
            */    
        }
        

    });
       
    $scope.changePath = tabsModel.changePath;
//	$scope.currentTab = {'path': ["bin","das","Dadi.cpp"]};
    //$scope.currentTab = $scope.current.doc.path;
	$scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        indentUnit: 4,
		indentWithTabs: true,
        value: $scope.current.room.data.text,
        extraKeys: {
            "Esc": function(cm) {
                if (roomGlobal.isFullScreen(cm)) $scope.setFullScreen(false);
            },
            "Ctrl-S": function(cm) {
                roomModel.saveevent($scope.current.room, cm);
            },
        },
        onLoad : function(cm){
			// Editor part
		    $scope.current.room.editor = cm;
            $scope.editor = cm;
            cm.setSize('',roomGlobal.winHeight()-108);
            roomModel.registerEditorEvent($scope.current.room);
		    var _doc = cm.getDoc();
		    cm.focus();

		    // Options
		    CodeMirror.modeURL = "/lib/codemirror/mode/%N/%N.js";

        
                    if (roomGlobal.languagemap[$scope.current.room.data.type]){
                        if (roomGlobal.modemap[$scope.current.room.data.type])
                            $scope.editor.setOption('mode', roomGlobal.modemap[$scope.current.room.data.type]);
                        else
                            $scope.editor.setOption('mode', roomGlobal.languagemap[$scope.current.room.data.type]);

                        CodeMirror.autoLoadMode(cm, roomGlobal.languagemap[$scope.current.room.data.type]);
                    } else{
                        $scope.editor.setOption('mode', 'text/plain');
                        CodeMirror.autoLoadMode($scope.editor, '');
                    }

                    if ($scope.current.room.lock.debug)
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
        var wrap = $scope.editor.getWrapperElement();
        var height = wrap.style.height;
    	if($scope.show_console == false)
    	{
    		$scope.editor.setSize('',parseInt(height)-165);
            console.log(parseInt(height)-165);
    	}
    	else
    	{
    		$scope.editor.setSize('',parseInt(height)+165);
            console.log(parseInt(height)+165);
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

        if (! $scope.current.room.runEnabled() || $scope.current.room.lock.operation) 
           return;
        
        $scope.current.room.lock.operation = true;

        if ($scope.current.room.lock.run){
            socket.emit('kill');
        } else {
            $scope.current.room.consoleOutput = [];
            $scope.consoleState = "<running>";
            socket.emit('run',$scope.current.room.data);
        }

        $scope.consoleInput = "";
    }
   
    //-------------------------------------------------------------------
    //console

    $scope.rename  = function(n)
    {
        $scope.current.expressionList[n].showVar = false;
        $scope.current.expressionList[n].focus = true;
        socket.emit('rm-expr', {
            expr: $scope.current.expressionList[n].expr
        });
    }

    $scope.submitVar = function(n)
    {
        $scope.current.expressionList[n].showVar = true;
        $scope.current.expressionList[n].focus = false;

        if ($scope.current.expressionList[n].expr == '')
        {  
            $scope.current.expressionList.splice(n, 1);      
        } else{
            console.log('add ' + $scope.current.expressionList[n].expr + '#');
            socket.emit('add-expr', {
                expr: $scope.current.expressionList[n].expr
            });
        }
    }

    $scope.addVar = function(){
        var emp = {
            'expr': '',
            'showVar': false,
            'focus': true,
            'value':'',
            'type': ''
        };
        $scope.current.expressionList.push(emp);
    }

    $scope.consoleInputFn = function() {
        if ($scope.current.room.locks.debug || $scope.current.room.locks.run){
            socket.emit('stdin', {
                data: $scope.consoleInput + "\n"
            })
        } else{
            $scope.current.room.consoleOutput.push({
                type:'stdin', 
                content: $scope.consoleInput + "\n"
            });
        }
        $scope.consoleInput = "";
    }
    //-------------------------------------------------------------------
    $scope.debugFn = function(){

        if (! $scope.current.room.debugEnabled() || $scope.current.room.lock.operation )
            return;
        $scope.current.room.lock.operation = true;
        if ($scope.current.room.lock.debug){
            socket.emit('kill')
        } else{
            socket.emit('debug', $scope.current.room.data);
        }
    }

    $scope.debugStepFn = function() {
        if ($scope.current.room.lock.debug && $scope.current.room.waiting){
            socket.emit('step', {

            });
        }
    }

    $scope.debugNextFn = function() {
        if ($scope.current.room.lock.debug && $scope.current.room.waiting){
            socket.emit('next', {

            })
        }
    }

    $scope.debugFinishFn = function() {
        if ($scope.current.room.lock.debug && $scope.current.room.waiting){
            socket.emit('finish', {

            })
        }
    }
    $scope.debugContinueFn = function(){
        if ($scope.current.room.lock.debug && $scope.current.room.waiting){
            socket.emit('resume', {

            })
        }
    }

    // Debug 
   // Breakpoints
   $scope.runToLine = function(n) {
        if($scope.runningLine >= 0) {
            $scope.current.room.editor.removeLineClass($scope.current.room.runningLine, '*', 'running');
            $scope.current.room.editor.setGutterMarker($scope.current.room.runningLine, 'runat', null);
        }
        if(n >= 0) {
            $scope.current.room.editor.addLineClass(n, '*', 'running');
            $scope.current.room.editor.setGutterMarker(n, 'runat', 
                angular.element('<div><img src="images/arrow.png" width="16" height="16" style="min-width:16px;min-width:16px;" /></div>')[0]);
            $scope.current.room.editor.scrollIntoView({line:n, ch:0});
        }
        $scope.current.room.runningLine = n;
    }

    $scope.removeAllBreakpoints = function() {
        for (var i = 0; i < $scope.current.room.bps.length; i++){
            if ($scope.current.room.bps[i] == "1"){
                var info = $scope.current.room.editor.lineInfo(i);
                if (info.gutterMarkers && info.gutterMarkers["breakpoints"]) {
                    $scope.current.room.editor.setGutterMarker(i, 'breakpoints', null);
                }
            }
        }
        $scope.current.room.bps.replace("1", "0");
    }

    $scope.initBreakpoints = function(bpsstr) {
        $scope.current.room.bps = bpsstr;
        for (var i = bpsstr.length; i < $scope.current.room.editor.lineCount(); i++){
            $scope.current.room.bps += "0";
        }
        for (var i = 0; i < $scope.current.room.bps.length; i++){
            if ($scope.current.room.bps[i] == "1"){
                
                var element = angular.element('<div><img src="images/breakpoint.png" /></div>')[0];
                $scope.current.room.editor.setGutterMarker(i, 'breakpoints', element);

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

    window.onresize = function()
    {
        //var wrap = $scope.editor.getWrapperElement();
        //var height = wrap.style.height;
        if(!$scope.show_console)
        {
            $scope.editor.setSize(" ",roomGlobal.winHeight()-108);
        }
        else
        {
            $scope.editor.setSize(" ",roomGlobal.winHeight()-274);
        }
    }

    //expression list

}