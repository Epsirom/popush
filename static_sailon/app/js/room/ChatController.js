'use strict';

function ChatController($scope, userModel, roomModel, socket, $location, $cookies){

	socket.onScope($scope, {
		'chat': function (data){
			var type = function(){
				if (data.name == userModel.user.name)
					return 'self';
				return '';
			}
			var time = function(){
					var time = new Date(data.time);
					return time.toTimeString().substr(0, 8);
				}

			var msg = {
				'name': data.name,
				'type': type,
				'content': data.text,
				'time':time
			}
			$scope.chatMessage.push(msg);
		}
	});

	$scope.chatMessage = []
	
	$scope.sendChatMessage = function() {
		if ($scope.chatInput == '')
			return;
		socket.emit('chat', {
			text: $scope.chatInput
		});
		$scope.chatInput = '';
	}
}