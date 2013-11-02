'use strict';

function ChatController($scope, userModel, roomModel, socket, $location, $cookies){
	$scope.current = roomModel.getCurrentDoc();
    $scope.$on('$destroy', function() {
        roomModel.leaveRoom($scope.current);
    });

	socket.onScope($scope, {
		'chat': function (data){
			var time = new Date(data.time);
			var msg = {
				'name': data.name,
				'type': data.name == userModel.user.name?'self':'',
				'content': data.text,
				'time':time.toTimeString().substr(0, 8)
			}
			$scope.current.chat.push(msg);
		}
	});

	$scope.sendChatMessage = function() {
		if ($scope.chatInput == '')
			return;
		socket.emit('chat', {
			text: $scope.chatInput
		});
		$scope.chatInput = '';
	}
}