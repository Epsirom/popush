'use strict';

function FileListController($scope, tabsModel, userModel, fileTreeModel, roomGlobal, socket, messageModel, roomModel) {
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
		},
		'move': function(data) {
			if (data.err) {
				messageModel.append('ranameErr:' + data.err);
			} else {
				messageModel.append('renamesuccess');
				socket.emit('doc', {
					'path': tabsModel.getPath()
				});
			}
		},
		'delete': function(data) {
			if (data.err) {
				messageModel.append('deleteErr:' + data.err);
			} else {
				messageModel.append('deletesuccess');
			}
			socket.emit('doc', {
				'path': tabsModel.getPath()
			});
		}
	});

	$scope.isMyself = function(path) {
		if (path.split('/')[1] == userModel.user.name) {
			return true;
		} else {
			return false;
		}
	}

	$scope.changePath = tabsModel.changePath;

	$scope.nextPath = function(tab, obj) {
		if (obj.type == 'doc') {
			tabsModel.createRoom(obj, tabsModel.enterRoom);
		} else if (obj.type == 'dir') {
			//var nextobj = fileTreeModel.select(tab.doc.path + '/' + obj.name);
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

	$scope.operateMode = 'default';
	$scope.creater = {
		'type': 'none',
		'name': ''
	}

	$scope.itemMode = [];
	// item mode can be: 'rename', 'delete'
	$scope.tmpName = [];
	$scope.invalid = '';

	$scope.enterCreate = function(ntype) {
		if ($scope.operateMode == 'create') {
			if ($scope.creater.type != ntype) {
				$scope.creater.type = ntype;
			} else {
				$scope.operateMode = 'default';
			}
		} else {
			$scope.operateMode = 'create';
			$scope.creater.type = ntype;
		}
	};

	$scope.$watch('creater.name',function(){
		if(/\/|\\|@/.test($scope.creater.name)) {
			$scope.invalid = 'INVALID_FILENAME';
			console.log($scope.invalid);
			return;
		}
		if($scope.creater.name.length > 32) {
			$scope.invalid = 'FILE_SIZE';
			return;
		}
		$scope.invalid = '';
	});

	$scope.enterRename = function() {
		$scope.operateMode = $scope.operateMode == 'rename' ? 'default' : 'rename';
	};
	$scope.enterDelete = function() {
		$scope.operateMode = $scope.operateMode == 'delete' ? 'default' : 'delete';
	};
	$scope.enterShare = function() {
		$scope.operateMode = $scope.operateMode == 'share' ? 'default' : 'share';
	};
	$scope.createFile = function() {
		if (!$scope.creater.name) {
			
		} else {
			socket.emit('new', {
				'type': $scope.creater.type,
				'path': tabsModel.getPath() + "/" + $scope.creater.name
			});
			$scope.creater.name = '';
			$scope.operateMode = 'default';
		}
	};
	$scope.renameFile = function(index, name) {
		socket.emit('move', {
			'path': tabsModel.getPath() + "/" + name,
			'newPath': tabsModel.getPath() + "/" + $scope.tmpName[index]
		});
		$scope.itemMode[index] = '';
	};
	$scope.deleteFile = function(index, obj) {
		socket.emit('delete', {
			'path': obj.path
		});
		$scope.itemMode[index] = '';
	}
}