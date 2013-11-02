'use strict';

function ChatController($scope, userModel, roomModel, socket, $location, $cookies){
	socket.onScope($scope, {
		'chat': function (data){
			var msg = {
				'name': data.name,
				'type': function (){
					if (data.name == userModel.user.name)
						return 'self';
					return '';
				},
				'content': data.text,
				'time': function(){
					var time = new Date(data.time);
					return time.toTimeString().substr(0, 8);
				}
			}
			roomModel.currentDoc.chat.push(msg);
		}
	});

	function sendChatMessage () {
		if ($scope.chatInput == '')
			return;
		socket.emit('chat', {
			text: $scope.chatInput
		});
		$scope.chatInput = '';
	}
}