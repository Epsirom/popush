'use strict';
/*
function checkrunanddebug(ext) {
	if(ENABLE_RUN) {
		runable = isrunable(ext);
	}
	if(ENABLE_DEBUG) {
		debugable = isdebugable(ext);
		if(debugable) {
			gutterclick = function(cm, n) {  //加断点信息
				if(debugLock && !waiting)
					return;
				if (!removebreakpointat(cm, n)){
					addbreakpointat(cm, n);
				}
			};
		} else {
			gutterclick = function(cm, n) { };
		}
		removeallbreakpoints();
	}
	setrunanddebugstate();
}
*/


//不同的操作使用一个lock吗，比如说：语音、文字、调试的lock，
function RoomModel(socket, $location, $route, POPUSH_SETTINGS) {
	 
	var currentDoc = {},  //'version', 'type','txt'
		editor = CodeMirror.fromTextArea(),
		lock = {'run':false, 'debug':false, 'operation':false, 'chat':false, 'voice':false},
		state = 0, //editing = 0, running = 1, debugging = 2
		saving =false; //if file is saving, then saving  = true

	var filepart = currentDoc.name.split('.');
	var ext = filepart[filepart.length - 1]; //get the extension of the file

	currentDoc.type = ext; //??

	(function changeLanguage(language) { //codeMirror
		if(languagemap[language]) {
			if(modemap[language])
				editor.setOption('mode', modemap[language]);
			else
				editor.setOption('mode', languagemap[language]);

			CodeMirror.autoLoadMode(editor, languagemap[language]);
		} else {
			editor.setOption('mode', 'text/plain');
			CodeMirror.autoLoadMode(editor, '');
		}
	})(ext);

	var runable = function (ext){
		if (! ENABLE_RUN)
			return false;
		for (var i = 0; i < runableext.length; i ++){
			if (runableext[i] == ext)
				return true;
		}
		return false;
	}

	var debugable = function (ext){
		if (! ENABLE_DEBUG)
			return false;

		for( var i = 0; i < debugableext.length; i++) {
			if (debugableext[i] == ext)
				return true;
		}
		return false;
	}
	

	/*Break Point*/

	/* wrap */
	/*
	var room = {
		'currentDoc':currentDoc,
		'lock': lock, 
		'state': state,
		'runable': runable,
		'debugable': debugable,
		'bq': [],
		'bps': "",
		'runningLne': -1,
		'saving': saving,
		'waiting': false,
		'oldText': "",
		'oldBps': "",
		'runEnabled': function(){return runable && !lock.debug && (!saving || lock.run)},
		'debugEnabled': function(){return debugable && !lock.run && (!saving || lock.debug)},

		// Console 
		'console': false, //open = true, close = false
		'consoleMessage' : {} //type: , msg:

		// chat
		'chat' : "", //text content

		// voice 
		'voice' : false//in use = true, close = false
	};

	return room;
	*/

	return{
		// doc 
		currentDoc: currentDoc,
		lock: lock, 
		state: state,
		runable: runable,
		debugable: debugable,
		q:[],
		bq: [],
		bps: "",
		runningLne: -1,
		
		saving: saving,
		waiting: false,
		oldText: "",
		oldBps: "",
		runEnabled: function(){return runable && !lock.debug && (!saving || lock.run)},
		debugEnabled: function(){return debugable && !lock.run && (!saving || lock.debug)},
		
		// Console 
		console: false, //open = true, close = false
		consoleMessage: [], //type: , msg:

		// chat
		chat: [], //text content

		// voice 
		voice : false//in use = true, close = false
	}
}