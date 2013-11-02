'use strict';

function RoomModel(socket, $location, $route, POPUSH_SETTINGS) {

	var docList = [];
	var currentDoc = {};
	 
	socket.onScope($scope, {
		'set':function (data) {
			//check if the doc is opening
			var existed = false;
			for (var i = 0; i < docList.length; i ++)
				if (docList[i].doc.path == data.path)
				{
					currentDoc = docList[i];
					existed = true;
					break;
				}

			if (! existed)
			{
				var doc = data;
				var ext = function(){ //get the extension of the file
					var filepart = doc.name.split('.');
					filepart[filepart.length - 1];
					doc.type = ext; 
				}

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
				var editor;
				currentDoc = {
					'doc': doc,
					'editor' : editor,
					'lock': {'run':false, 'debug':false, 'operation':false, 'chat':false, 'voice':false},
					'state': 0, //editing = 0, running = 1, debugging = 2
					'saving': false, //if file is saving, then saving  = true

					'runable': runable,
					'debugable': debugable,

					'q':[],
					'bq': [],
					'bps': "",
					'runningLne': -1,

					'waiting': false,
					'oldText': "",
					'oldBps': "",
					
					'runEnabled': function(){return runable && !lock.debug && (!saving || lock.run)},
					'debugEnabled': function(){return debugable && !lock.run && (!saving || lock.debug)},
					
					// Console 
					'consoleOpen': false, //open = true, close = false
					'consoleMessage': [], //type: , msg:

					// chat
					'chat': [], //text content

					// voice 
					'voiceOn' : false//in use = true, close = false
				}
				docList.push(currentDoc);
			}

       }
   });

	return currentDoc;
}