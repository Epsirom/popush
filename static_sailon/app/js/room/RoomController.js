'use strict';


function RoomController($scope, userModel, socket, $location, tabsModel, roomGlobal, roomModel) {
    $scope.current = roomModel.getCurrentDoc();
    $scope.$on('$destroy', function() {
        roomModel.leaveRoom($scope.current);
    })

    socket.onScope($scope, {
        'run': function (data){
            //open the console
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

            $scope.current.lock.operation = false;

            $scope.current.lock.run = true;
        },

        'running': function (data) {
            if (! $scope.current.lock.debug)
                return;
            $scope.current.waiting = false;
            //runtoline(-1);

        },
        'waiting': function (data) {
            if (! $scope.current.lock.debug)
                return;
            $scope.current.waiting = true;
            if (typeof data.line == 'number'){
                runtoline(data.line - 1);
            } else {
                runToLine(-1);
            }
            /*
            for(var k in data.exprs) {
                expressionlist.setValue(k, data.exprs[k]);
            }
            */
            //绑定调试按钮－－》解除禁用属性
        },

        'exit': function (data){
            $scope.current.lock.operation = false;
            if(data.err.code !== undefined){
                var time = new Date();
                var msg = {
                    'name': 'system',
                    'type': 'system',
                    'content': 'programfinish ' + data.err.code,
                    'time': time.toTimeString().substr(0, 8) 
                }
                $scope.current.chat.push(msg);
                $scope.consoleState = "<finish>";

            } else{
                var time = new Date();
                var msg = {
                    'name': 'system',
                    'type': 'system',
                    'content': 'programkilledby '+ data.err.signal,
                    'time': time.toTimeString().substr(0, 8) 
                }

                $scope.current.chat.push(msg);
                $scope.consoleState = "<killed>";
            }

            //editor-run 激活一个小图标 icon-play
            if ($scope.current.lock.run)
                $scope.current.lock.run = false;

            if ($scope.current.lock.debug){  

                $scope.current.editor.setValue($scope.current.oldText);
                removeAllBreakpoints();
                $scope.current.initbreakpoints(oomModel.currentDoc.oldText);

                var editordoc = $scope.current.editor.getDoc();
                var hist = editordoc.getHistory();
                hist.done.pop();
                editordoc.setHistory(hist);

                $scope.current.editor.setOption('readOnly', false);   
                if(q.length > 0){
                    socket.emit('change', q[0]);
                }

                runtoline(-1);
                /*??
                for(var k in expressionlist.elements) {
                    expressionlist.setValue(expressionlist.elements[k].expression, null);
                }
                */
                $scope.current.lock.debug = false;
            }
        },

        'debug': function (data){
            $scope.current.editor.setOption('readOnly', true);
            //聊天窗口显示系统消息
            //...
            //setdebug：
            //打开console

            /*接下来是一系列神奇的断点操作
            old_text = editor.getValue();
            old_bps = bps;
            editor.setValue(data.text);
            //removeallbreakpoints(); y?
            //initbreakpoints(data.bps); y?

            var editordoc = editor.getDoc();
            var hist = editordoc.getHistory();
            hist.done.pop();
            editordoc.setHistory(hist);
            */
            $scope.current.oldText = $scope.current.editor.getValue();
            $scope.current.oldBps = r$scope.current.bps;
            $scope.current.editor.setValue(data.text);
            removeAllBreakpoints();
            initBreakpoints(data.bps);
            var hist = $scope.current.editor.getDoc().getHistory();
            hist.done.pop();
            $scope.current.editor.getDoc().setHistory(hist);
            $scope.current.lock.operation = false;

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
		//value: "function test()\n{\n\tvar Huarong = 'Dadi', Yanglei = 'Nanshen';\n}",
        value: $scope.current.data.text,
        onLoad : function(cm){
				    // Editor part

				    $scope.editor = cm;
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
   					//

				    // Events
				    cm.on("gutterClick", function(cm, n) {
                        $scope.gutterclick(cm, n);
                    });
				},
        extraKeys: {
            "Esc": function(cm) {
                if (roomGlobal.isFullScreen(cm)) $scope.setFullScreen(false);
                //resize();
            }
        },
		gutters: ["runat", "CodeMirror-linenumbers", "breakpoints"],
    };

    $scope.chat_show = false;
    $scope.editor_width = 'span12'; 
    $scope.show_console = false;

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
    
    var temp;
    $scope.setFullScreen = function(full)
    {
        var wrap = $scope.editor.getWrapperElement();
        if (full) 
        {
            wrap.className += " CodeMirror-fullscreen";
            temp = wrap.style.height;
            wrap.style.height = roomGlobal.winHeight() + "px";
            document.documentElement.style.overflow = "hidden";
        }
        else
        {
            wrap.className = wrap.className.replace(" CodeMirror-fullscreen", "");
            wrap.style.height = temp;
            document.documentElement.style.overflow = "";
        }
        $scope.editor.refresh();
        $scope.editor.focus();
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



    /*
    $scope.inputMessage="123";
    $scope.sendChatMessage = function()
    {   
        $scope.inputMessage = "";
    	
        if($scope.inputMessage != "")
        {   
            $scope.newMsg.content = $scope.inputMessage;
            //$scope.newMsg.name = "fuge";
            //$scope.newMsg.time = "10:57:39";
            $scope.chatmessages.content.push($scope.newMsg);
            $scope.chatmessages.name.push($scope.newMsg);
            $scope.chatmessages.time.push($scope.newMsg);
            $scope.inputMessage = "";
        }
        
    }
*/

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
        if ($scope.current.lock.debug || $scope.current.lock.run){
            socket.emit('stdin', {
                data: $scope.consoleInput + "\n"
            })
        }
        $scope.consoleInput = "";
    }


}