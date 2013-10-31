'use strict';

function FileTreeController($scope, userModel, fileTreeModel, socket, tabsModel){
	$scope.tree = fileTreeModel;
	$scope.changeSharedStatus = function() {
		if (fileTreeModel.rootStatus.shared !== 'off') {
			fileTreeModel.rootStatus.shared = 'off';
		} else {
			fileTreeModel.updateRoot();
		}
	};
	$scope.updateFolder = function(doc) {
		if (doc.status !== 'off') {
			doc.status = 'off';
		} else {
			fileTreeModel.updateByObj(doc);
		}
	}
	$scope.openFolder = function(doc) {
		if (doc.status !== 'off') {
			doc.status = 'off'
		} else {
			doc.status = 'on';
		}
	}
	$scope.showFolder = function(doc) {
		$scope.updateFolder(doc);
		tabsModel.addFolder(doc);
	}
	$scope.showSharedFolder = function(doc) {
		$scope.openFolder(doc);
		tabsModel.addFolder(doc);
	}
	fileTreeModel.closeChildren({'nodes': fileTreeModel.shared});
}