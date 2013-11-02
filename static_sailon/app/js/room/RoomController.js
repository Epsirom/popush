'use strict';


function RoomController($scope, userModel, socket, $location, tabsModel, roomGlobal, roomModel) {
    $scope.current = roomModel.getCurrentDoc();
    $scope.$on('$destroy', function() {
        roomModel.leaveRoom($scope.current);
    })

    socket.onScope($scope, {
        'run': function (data){
            //聊天窗口显示系统消息
            //...
            //setrun：
            //打开console
            roomModel.getCurrentDoc().lock.operation = false;
        },
    });
       
    $scope.changePath = tabsModel.changePath;
//	$scope.currentTab = {'path': ["bin","das","Dadi.cpp"]};
    //$scope.currentTab = roomModel.currentDoc.doc.path;
	$scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        indentUnit: 4,
		indentWithTabs: true,
		//value: "function test()\n{\n\tvar Huarong = 'Dadi', Yanglei = 'Nanshen';\n}",
        value: roomModel.getCurrentDoc().data.text,
        onLoad : function(cm){
				    // Editor part

				    $scope.editor = cm;
				    var _doc = cm.getDoc();

				    cm.focus();

				    // Options
				    CodeMirror.modeURL = "/lib/codemirror/mode/%N/%N.js";
        
                    if (roomGlobal.languagemap[roomModel.getCurrentDoc().data.type]){
                        if (roomGlobal.modemap[roomModel.getCurrentDoc().data.type])
                            $scope.editor.setOption('mode', roomGlobal.modemap[roomModel.getCurrentDoc().data.type]);
                        else
                            $scope.editor.setOption('mode', roomGlobal.languagemap[roomModel.getCurrentDoc().data.type]);

                        CodeMirror.autoLoadMode(cm, roomGlobal.languagemap[roomModel.getCurrentDoc().data.type]);
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

        console.log('run');

        if (! roomModel.getCurrentDoc().runEnabled() || ! roomModel.getCurrentDoc().lock.operation) 
            return;
        
        roomModel.getCurrentDoc().lock.operation = true;

        if (! roomModel.getCurrentDoc().lock.run){
            socket.emit('kill');
        } else {
            socket.emit('run',roomModel.getCurrentDoc().data);
        }
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


    // chat-window
    $scope.chatmessages=[
        {
            'name':'Leige',
            'time':'10:57:38',
            'content':'Hello everyone, I am a idiot, absolutely.'
        },
        {
            'name':'Leige',
            'time':'10:57:39',
            'content':'Will you marry me?'
        },
    ];


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

    $scope.addVar = function()
    {
        $scope.vars.push({'name':'','showVar':false,'focus':true,'value':'Dadi'});
    }


}