'use strict';

function WorkspaceController($scope, userModel, socket, $cookies, $location, messageModel, tabsModel, fileTreeModel){
	$scope.user = userModel.user;
	$scope.logoutFn = userModel.logout;
	$scope.showSettings = tabsModel.showSettings;
	$scope.members = tabsModel.members;
	$scope.openRoot = function() {
		tabsModel.addFolder(fileTreeModel.select("/" + userModel.user.name));
	}
}