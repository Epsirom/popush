'use strict';

function RoomController($scope, userModel, socket, $location, tabsModel, roomGlobal, roomModel) {
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
				    cm.setOption("mode", "javascript");
   					CodeMirror.autoLoadMode(cm, "javascript");

				    // Events
				    cm.on("gutterClick", function(cm, n) {
                        gutterclick(cm, n);
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

    $scope.toggleConsole = function()
    {
    	if($scope.show_console == false)
    	{
    		$scope.editor.setSize('',370);
    	}
    	else
    	{
    		$scope.editor.setSize('',545);
    	}
        $scope.show_console = !$scope.show_console;
    }

    $scope.toggleChat = function()
    {
        $scope.chat_show = !$scope.chat_show;
        $scope.editor.refresh();
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

    $scope.inputMessage="123";
    $scope.sendChatMessage = function()
    {   
        $scope.inputMessage = "";
    	/*
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
        */
    }


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