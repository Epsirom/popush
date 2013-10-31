'use strict';

function FileListController($scope, tabsModel, userModel, fileTreeModel, roomGlobal, socket, messageModel) {
	socket.onScope($scope, {
		'new': function(data) {
			if (data.err) {
				messageModel.append('createErr:' + data.err);
			} else {
				if ($scope.creater.type == 'doc') {
					messageModel.append('createfilesuccess');
				} else {
					messageModel.append('createfoldersuccess');
				}
				socket.emit('doc', {
					'path': tabsModel.getPath()
				});
			}
		}
	})
	$scope.changePath = function(tab, index) {
		var newPath = tab.doc.path.split('/').slice(0, index + 2).join('/'),
			obj = fileTreeModel.select(newPath);
		fileTreeModel.closeChildren(obj);
		if (index == 0) {
			fileTreeModel.updateRoot();
		} else {
			fileTreeModel.updateByObj(obj);
		}
		tabsModel.changeDoc(obj);
	}

	$scope.nextPath = function(tab, obj) {
		if (obj.type == 'doc') {

		} else if (obj.type == 'dir') {
			var obj = fileTreeModel.select(tab.doc.path + '/' + obj.name);
			fileTreeModel.updateByObj(obj);
			tabsModel.changeDoc(obj);
		}
	}

	$scope.getExt = function(doc) {
		if (doc.type == 'dir') {
			return 'dict';
		}
		var fileName = doc.name.split('.'), ext = fileName[fileName.length - 1];
		if (roomGlobal.languagemap[ext]) {
			return ext;
		} else {
			return 'file';
		}
	}

	$scope.creater = {
		'type': 'none'
	}

	$scope.enterType = function(ntype) {
		$scope.creater.type = ntype;
	}
	$scope.createFile = function() {
		socket.emit('new', {
			'type': $scope.creater.type,
			'path': tabsModel.getPath() + "/" + $scope.creater.name
		});
		$scope.creater.type = 'none';
		$scope.creater.name = '';
	}
}