'use strict';

function MessageController($scope, userModel,$timeout) {
	//The initial value of messages should be null, below setting is only for test
	$scope.messages=['服务器错误'];
	$scope.removeMsg = function(msgId){
		$scope.messages.splice(msgId, 1);
	}
	//This function can be used to alert a message on the right side of the screen.
	$scope.alertMsg = function(msg){ 
		if($scope.messages.length >= 10)
			$scope.removeMsg(0);
		$scope.messages.push(msg);
		$timeout(function(){
             $scope.removeMsg($scope.messages.length - 1);
         }, 1200);
	}
}