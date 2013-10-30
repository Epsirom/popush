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

/*

function runenabled(){
	return (runable && !debugLock && (!issaving || runLock));
}

function debugenabled(){
	return (debugable && !runLock && (!issaving || debugLock));
}

*/
function docModel(socket, $location, $route, POPUSH_SETTINGS) {
	 
	var currentDoc = {},  //'version', 'type'
		lock = {'run':false, 'debug':false, 'operation':false},
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

	return{
		currentDoc: currentDoc,
		lock: lock, 
		state: state,
		runable: runable,
		debugable: debugable,
		bq: []
		bps: "",
		runningLne: -1,
		console: false, //open = true, close = false
		saving: saving,
		oldText: "",
		oldBps: "",
		runEnabled: function(){return runable && !lock.debug && (!saving || lock.run)},
		debugEnabled: function(){return debugable && !lock.run && (!saving || lock.debug)} 
	}
}