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
function EditorController($scope, userModel, socket, $location) {
	$scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        indentUnit: 4,
		indentWithTabs: true,
		value: "function test()\n{\n\tvar Huarong = 'Dadi', Yanglei = 'Nanshen';\n}",
        onLoad : function(_editor){
				    // Editor part
				    $scope.editor = _editor;
				    var _doc = _editor.getDoc();
				    _editor.focus();

				    // Options
				    CodeMirror.modeURL = "/lib/codemirror/mode/%N/%N.js";
				    _editor.setOption("mode", "javascript");
   					CodeMirror.autoLoadMode(_editor, "javascript");

				    // Events
				    _editor.on("beforeChange", function(){ });
				    _editor.on("change", function(){ });
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
		        onLoad : function(_editor){
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

    $scope.setFullScreen = function()
    {

    }
}