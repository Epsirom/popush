'use strict';

function FileTreeController($scope, userModel, fileTreeModel, socket){
	$scope.tree = fileTreeModel;
	var isClicked = false;
	$scope.changeSharedStatus = function() {
		if (fileTreeModel.rootStatus.shared > 0) {
			fileTreeModel.rootStatus.shared = 0;
		} else {
			fileTreeModel.rootStatus.shared = 2;
			socket.emit('doc', {
				'path': '/' + userModel.user.name
			});
		}
	};
	$scope.updateFolder = function(doc) {
		if (doc.status > 0) {
			doc.status = 0
		} else {
			doc.status = 2;
			socket.emit('doc', {
				'path': doc.path
			});
		}
	}
	$scope.openFolder = function(doc) {
		if (doc.status > 0) {
			doc.status = 0
		} else {
			doc.status = 1;
		}
	}
	$scope.showFolder = function(doc) {
		alert("hehehe");
	}
}