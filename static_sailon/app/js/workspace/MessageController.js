'use strict';

function MessageController($scope, messageModel) {
	$scope.messages = messageModel.msgs;
	$scope.removeMsg = messageModel.remove;
}