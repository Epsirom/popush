'use strict';

function MessageModel($timeout, socket) {
	var msgs = [];
	var curId = 0;

	var appendMsg = function(msg, tout) {
		if(msgs.length >= 10)
			removeMsg(0);
		var newId = ++curId;
		msgs.push({'msg': msg, 'id': newId});
		$timeout(function(){
             removeMsgByID(newId);
         }, (tout || 5000));
	}

	var removeMsg = function(msgid) {
		msgs.splice(msgid, 1);
	}

	var removeMsgByID = function(id) {
		var i, len;
		for (i = 0, len = msgs.length; i < len; ++i) {
			if (msgs[i].id === id) {
				return removeMsg(i);
			}
		}
	}
	
	return {
		'msgs': msgs,
		'append': appendMsg,
		'remove': removeMsgByID
	}
}