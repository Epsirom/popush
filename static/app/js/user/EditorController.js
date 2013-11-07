'use strict';

var languagemap = { 
	'c':		'clike',
	'clj':		'clojure',
	'coffee':	'coffeescript',
	'cpp':		'clike',
	'cs':		'clike',
	'css':		'css',
	'go':		'go',
	'h':		'clike',
	'htm':		'htmlmixed',
	'html':		'htmlmixed',
	'hpp':		'clike',
	'java':		'clike',
	'js':		'javascript',
	'json':		'javascript',
	'lisp':		'commonlisp',
	'lua':		'lua',
	'md':		'markdown',
	'pas':		'pascal',
	'php':		'php',
	'pl':		'perl',
	'py':		'python',
	'rb':		'ruby',
	'sql':		'sql',
	'tex':		'stex',
	'vbs':		'vb',
	'xml':		'xml',
};

function winHeight() {
    return window.innerHeight || (document.documentElement || document.body).clientHeight;
}

function isFullScreen(cm) {
    return /\bCodeMirror-fullscreen\b/.test(cm.getWrapperElement().className);
}

function EditorController($scope, userModel, socket, $location) {
	$scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        indentUnit: 4,
		indentWithTabs: true,
		value: "function test()\n{\n\tvar Huarong = 'Dadi', Yanglei = 'Nanshen';\n}",
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
				    cm.on("beforeChange", function(){ });
				    cm.on("change", function(){ });
				},
        extraKeys: {
            "Esc": function(cm) {
                if (isFullScreen(cm)) $scope.setFullScreen(false);
                //resize();
            }
        },
		gutters: ["runat", "CodeMirror-linenumbers", "breakpoints"],
    };

    var arr1 = new Array("bin","das","Dadi.cpp");
    var arr2 = new Array("bin","das");
    var arr3 = new Array("bin","das");
    $scope.tabs = 
    [
    	{
    		'id':0,
    		'title':'Dadi.cpp',
    		'type':'file',
    		'path':arr1
    	},
    	{
    		'id':1,
    		'title':'/',
    		'type':'folder',
    		'path':arr2
    	},
    	{
    		'id':2,
    		'title':'/t/',
    		'type':'folder',
    		'path':arr3
    	}
    ];
    $scope.files = 
    [
    	{
    		'name':'Dadi.cpp',
    		'icon':'cpp',
    		'type':'file',
    		'status': '共享',
    		'time':'2013-10-19 10:20'
    	},
    	{
    		'name':'YangLei.c',
    		'icon':'c',
    		'type':'file',
    		'status': '共享',
    		'time':'2013-10-19 10:20'
    	},
    	{
    		'name':'chenfan.py',
    		'icon':'py',
    		'type':'file',
    		'status': '共享',
    		'time':'2013-10-19 10:20'
    	},
    	{
    		'name':'NanshenLei',
    		'icon':'html',
    		'type':'file',
    		'status': '共享',
    		'time':'2013-10-19 11:20'
    	},
    	{
    		'name':'NanshenLei',
    		'icon':'dict',
    		'type':'folder',
    		'status': '共享',
    		'time':'2013-10-19 11:20'
    	}
    ];

    $scope.openFile = function(name,icon,type)
    {
    	for(var i = 0; i < $scope.tabs.length; i++)
    	if($scope.tabs[i].active==true)
    	{
    		$scope.tabs[i].title = name;
		    $scope.tabs[i].type = type;
		    $scope.tabs[i].path.push(name);
		    break;
		}
		if(type=='file')
		{
   			$scope.editorOptions = {
		        lineWrapping : true,
		        lineNumbers: true,
		        indentUnit: 4,
				indentWithTabs: true,
				value: "<html>\n<body>\n</body>\n</html>",
		        onLoad : function(cm){
                            $scope.editor = cm;
						    CodeMirror.modeURL = "/lib/codemirror/mode/%N/%N.js";
		   					if(languagemap[icon])
							{
								$scope.editor.setOption("mode", languagemap[icon]);
   								CodeMirror.autoLoadMode($scope.editor, languagemap[icon]);
   							}
   							else
   							{
								$scope.editor.setOption('mode', 'text/plain');
								CodeMirror.autoLoadMode($scope.editor, '');
   							}
						},
                extraKeys: {
                    "Esc": function(cm) {
                        if (isFullScreen(cm)) $scope.setFullScreen(false);
                        //resize();
                    }
                },
				gutters: ["runat", "CodeMirror-linenumbers", "breakpoints"],
    		};
   		}
    }

    $scope.closeFile = function()
    {
    	var id = 0;
    	for(var i = 0; i < $scope.tabs.length; i++)
    	if($scope.tabs[i].active==true)
    	{
    		$scope.tabs.splice(i,1);
    		id = i;
		    break;
		}
    	for(var i = id; i < $scope.tabs.length; i++)
    	{
    		$scope.tabs[i].id --;
    	}
    }

    $scope.chat_show = false;
    $scope.editor_width = 'span12'; 
    $scope.show_tooltip = false;
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

    $scope.setFullScreen = function(full)
    {
        var wrap = $scope.editor.getWrapperElement();
        if (full) 
        {
            wrap.className += " CodeMirror-fullscreen";
            wrap.style.height = winHeight() + "px";
            $scope.show_tooltip = true;
            //$timeout($scope.show_tooltip = false, 1000);
            document.documentElement.style.overflow = "hidden";
        }
        else
        {
            wrap.className = wrap.className.replace(" CodeMirror-fullscreen", "");
            wrap.style.height = "";
            document.documentElement.style.overflow = "";
        }
        $scope.editor.refresh();
        $scope.editor.focus();
    }
    
    $scope.chatmessages=[
        {
            'name':'fuge',
            'time':'10:57:38',
            'content':'Hello everyone, I am idiot, absolutely.'
        },
        {
            'name':'fuge',
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
}