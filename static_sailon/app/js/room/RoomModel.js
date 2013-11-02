'use strict';

function RoomModel(socket, $location, $route, POPUSH_SETTINGS, tabsModel, fileTreeModel, roomGlobal, userModel) {

	var docList = [];
	var currentDoc = {};
	
	socket.forceOn('set', function (data) {
		//check if the doc is opening
		var existed = false;
		for (var i = 0; i < docList.length; i ++)
			if (docList[i].doc.path == tabsModel.getDestDoc().path)
			{
				currentDoc = docList[i];
				existed = true;
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
				'consoleMessage': [], //type: , msg:

				// chat
				'chat': [], //text content

				// voice 
				'voiceOn' : false//in use = true, close = false
			}
			docList.push(currentDoc);
			tabsModel.enterRoom(tabsModel.getDestDoc());
		}
   	});
	return {
		'getCurrentDoc': function() {return currentDoc;}
	};
}