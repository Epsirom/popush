'use strict';

function TabsController($scope, userModel, socket, $location, tabsModel) {
    $scope.tabs = tabsModel.tabs;
    $scope.currentTab = tabsModel.current;
    tabsModel.showSettings();

    $scope.closeTab = function(index)
    {
        $scope.tabs.splice(index, 1);
    }
}