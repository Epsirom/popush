'use strict';

function TabsController($scope, userModel, socket, $location, tabsModel, fileTreeModel) {
	$scope.tabMgr = tabsModel;

    $scope.selectTab = tabsModel.setCurrent;

    $scope.closeTab = function(index)
    {
    	if (tabsModel.tabs.length > 1){
    		var tmpObj = tabsModel.tabs[index].doc;
    		tabsModel.tabs.splice(index, 1);
    		if (tmpObj) {
    			tmpObj.viewMode = 'off';
    		}
    		fileTreeModel.closeChildren(tmpObj);
    		tmpObj.status = 'off';
    	}
        	
    }
}