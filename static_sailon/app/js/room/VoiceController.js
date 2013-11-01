'use strict';

function ChatController($scope, roomModel, socket, $location, $cookies){

	function leaveVoiceRoom() {
		
	}

	function enterVoiceRoom () {
		
	}

	function voiceSwitchFn () {
		if (roomModel.lock.voice)
			return;
		roomModel.lock.voice = true;

		if (roomModel.voice) 
			leaveVoiceRoom();
		else
			enterVoiceRoom();
	}
}