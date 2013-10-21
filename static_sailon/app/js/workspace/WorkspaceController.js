'use strict';

function WorkspaceController($scope, userModel, socket, $cookies, $location){
	$scope.user = userModel.user;
	$scope.logoutFn = function() {
		socket.emit('logout', {
		});
		delete $cookies['sid'];
		$location.path("/"); 
	}
}