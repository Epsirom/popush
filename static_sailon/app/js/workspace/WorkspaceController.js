'use strict';

function WorkspaceController($scope, userModel, socket, $cookies, $location, messageModel, tabsModel){
	$scope.user = userModel.user;
	$scope.logoutFn = userModel.logout;
	$scope.showSettings = tabsModel.showSettings;
	messageModel.append('loginsuccess');
	$scope.members = tabsModel.members;
}