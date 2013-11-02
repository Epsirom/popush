'use strict';

function RoomModel(socket, $location, $route, POPUSH_SETTINGS, tabsModel, fileTreeModel, roomGlobal, userModel) {

	var docList = [];
	var currentDoc = {};
	
	var leaveRoom = function(room) {
		var i, len = docList.length;
		for (i = 0; i < len; ++i) {
			if (docList[i].doc.path == room.doc.path) {
				docList.splice(i, 1);
				break;
			}
		}
		socket.emit('leave', {});
	}

	socket.forceOn('set', function (data) {
		//check if the doc is opening
		var existed = false, curPath = tabsModel.getDestDoc().path;
		var i, len = docList.length;
		for (i = 0; i < len; ++i)
			if (docList[i].doc.path == curPath)
			{
				currentDoc = docList[i];
				existed = true;
				currentDoc.data = data;
				break;
			}

		if (! existed)
		{			
			var pathapart = tabsModel.getDestDoc().path.split('/');
			var filepart = pathapart[pathapart.length - 1].split('.');
			var ext = filepart[filepart.length - 1];
			data.type = ext;

			var runable = function (ext){
				if (! POPUSH_SETTINGS.ENABLE_RUN)
					return false;
				for (var i = 0; i < roomGlobal.runableext.length; i ++){
					if (roomGlobal.runableext[i] == ext)
						return true;
				}
				return false;
			}

			var debugable = function (ext){
				if (! POPUSH_SETTINGS.ENABLE_DEBUG)
					return false;

				for( var i = 0; i < roomGlobal.debugableext.length; i++) {
					if (roomGlobal.debugableext[i] == ext)
						return true;
				}
				return false;
			}

			var editor, 
				expressionList = {},
				saving = false,
				lock = {
				//run & debug lock
				'run':false, 
				'debug':false, 
				'operation':false, 
				'chat':false, 
				'voice':false
				};

			currentDoc = {
				'doc': tabsModel.getDestDoc(),
				'expressionList': expressionList,
				'data': data,
				'editor' : editor,
				'state': 0, //editing = 0, running = 1, debugging = 2
				'saving': false, //if file is saving, then saving  = true
				'lock': lock,

				'runable': runable,
				'debugable': debugable,

				'q':[],
				'bq': [],
				'bps': "",
				'runningLne': -1,

				'waiting': false,
				'oldText': "",
				'oldBps': "",
				
				'runEnabled': function(){
					return runable && ! lock.debug && (!saving || lock.run)
				},
				'debugEnabled': function(){
					return debugable && !lock.run && (!saving || lock.debug)
				},
				
				// Console 
				'consoleOpen': false, //open = true, close = false
				'consoleOutput': [], //type: , content:

				// chat
				'chat': [], //name, type, time, content

				// voice 
				'voiceOn' : false//in use = true, close = false
			}
			docList.push(currentDoc);
			tabsModel.runCreateRoomCallback();

			//初始化editor
			//初始化expression list
		}

		//reset lock 
		currentDoc.lock.operation = false;
		currentDoc.lock.run = data.running;
		if (data.debugging){
			currentDoc.lock.debug = true;
			currentDoc.oldText = data.text;
			currentDoc.oldBps = data.bps;
			if (data.state == 'waiting'){
				currentDoc.waiting = true;
				runToLine(data.line - 1);
				/*
				if(data.line !== null)
					$('#console-title').setlocale('console|waiting');
				else
					$('#console-title').setlocale('console|waiting|nosource');
				*/

			}
		}		
		delete data.running;
		delete data.debugging;
		delete data.state;
   	});

	function runToLine(n) {
        if(currentDoc.runningLine >= 0) {
            currentDoc.editor.removeLineClass(currentDoc.runningLine, '*', 'running');
            currentDoc.editor.setGutterMarker(currentDoc.runningLine, 'runat', null);
        }
        if(n >= 0) {
            currentDoc.editor.addLineClass(n, '*', 'running');
            currentDoc.editor.setGutterMarker(n, 'runat', 
                angular.element('<div><img src="images/arrow.png" width="16" height="16" style="min-width:16px;min-width:16px;" /></div>')[0]);
            currentDoc.editor.scrollIntoView({line:n, ch:0});
        }
        currentDoc.runningLine = n;
    }

	return {
		'getCurrentDoc': function() {return currentDoc;},
		'leaveRoom': leaveRoom
	};
}