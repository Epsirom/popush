'use strict';

function FileTreeController($scope, userModel, fileTreeModel, socket){
	$scope.tree = fileTreeModel;
	$scope.changeSharedStatus = function() {
		if (fileTreeModel.rootStatus.shared !== 'off') {
			fileTreeModel.rootStatus.shared = 'off';
		} else {
			fileTreeModel.rootStatus.shared = 'loading';
			socket.emit('doc', {
				'path': '/' + userModel.user.name
			});
		}
	};
	$scope.updateFolder = function(doc) {
		if (doc.status !== 'off') {
			doc.status = 'off';
		} else {
			doc.status = 'loading';
			socket.emit('doc', {
				'path': doc.path
			});
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
		alert("hehehe");
	}
}