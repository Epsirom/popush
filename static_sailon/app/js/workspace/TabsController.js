'use strict';

function TabsController($scope, userModel, socket, $location, tabsModel, fileTreeModel) {
	$scope.tabMgr = tabsModel;
    tabsModel.addFolder(fileTreeModel.select("/" + userModel.user.name));

    $scope.selectTab = tabsModel.setCurrent;

    $scope.closeTab = function(index)
    {
    	if (tabsModel.tabs.length > 1)
        	tabsModel.tabs.splice(index, 1);
    }
}