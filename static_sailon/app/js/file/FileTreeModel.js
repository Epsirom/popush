'use strict';

function FileTreeModel(userModel, socket) {
	
	// Data

	var selfRoot = [], sharedRoot = [],
		rootStatus = {'self': 'on', 'shared': 'off'};

	// File Services

	var getNameByPath = function(path) {
		if (typeof(path) !== "string") {
			return;
		}
		var paths = path.split("/");
		return paths[paths.length - 1];
	}

	var refreshStatus = function(doc) {
		if (!doc.status) {
			doc.status = 'off';
		} else if (doc.status !== 'off') {
			doc.status = 'on';
		}
	}

	var refreshInfo = function(node, doc) {
		if (doc.createTime) {
			node.createTime = doc.createTime;
		}
		if (doc.modifyTime) {
			node.modifyTime = doc.modifyTime;
		}
		if (doc.members) {
			node.members = doc.members;
		}
		if (doc.path) {
			node.path = doc.path;
		}
		if (doc.permission) {
			node.permission = doc.permission;
		}
		if (doc.type) {
			node.type = doc.type;
		}
	}

	var selectRoot = function(path) {
		var paths = path.split("/"), i, len, currentRoot, j, lenj, flag, filename, folder, tmpPath;
		len = paths.length;
		if (len < 3) {
			return null;
		}
		flag = (paths[1] === userModel.user.name);
		currentRoot = flag ? selfRoot : sharedRoot;
		i = flag ? 2 : 1;
		for (; i < len - 1; ++i) {
			flag = false;
			for (j = 0, lenj = currentRoot.length; j < lenj; ++j) {
				if (currentRoot[j].name === paths[i]) {
					refreshStatus(currentRoot[j]);
					currentRoot = currentRoot[j].nodes;
					flag = true;
					break;
				}
			}
			if (!flag) {
				return null;
			}
		}
		lenj = len - 1;
		for (i = 0, len = currentRoot.length; i < len; ++i) {
			if (currentRoot[i].name === paths[lenj]) {
				refreshStatus(currentRoot[i]);
				return currentRoot[i];
			}
		}
		return null;
	};

	var clearTouch = function(root) {
		var i, len;
		for (i = 0, len = root.nodes.length; i < len; ++i) {
			root.nodes[i].touched = false;
		}
	};

	var deleteRoot = function(root) {
		if (root.nodes) {
			var i, len = root.nodes.length;
			for (i = 0; i < len; ++i) {
				deleteRoot(root.nodes[i]);
			}
			delete root.nodes;
		}
	}

	var removeUntouched = function(root) {
		var i, len;
		for (i = 0, len = root.nodes.length; i < len; ++i) {
			if (!root.nodes[i].touched) {
				deleteRoot(root.nodes[i]);
				delete root.nodes[i];
				root.nodes.splice(i, 1);
				--i;
				--len;
			}
		}
	};

	var touchFile = function(doc) {
		var paths = doc.path.split("/"), i, len, 
			currentRoot, j, lenj, flag, filename, tmpPath;
		len = paths.length;
		if (len < 3) {	// like "/chenhr" does not require touch.
			return;
		}
		flag = (paths[1] === userModel.user.name);
		currentRoot = flag ? selfRoot : sharedRoot;
		tmpPath = flag ? ("/" + paths[1]) : "";
		i = flag ? 2 : 1;
		for (; i < len - 1; ++i) {
			flag = false;
			tmpPath += ("/" + paths[i]);
			for (j = 0, lenj = currentRoot.length; j < lenj; ++j) {
				if (currentRoot[j].name === paths[i]) {
					currentRoot[j].path = tmpPath;
					currentRoot[j].touched = true;
					refreshStatus(currentRoot[j]);
					currentRoot = currentRoot[j].nodes;
					flag = true;
					break;
				}
			}
			if (!flag) {
				var curTime = new Date();
				var newFile = {
					'name': paths[i],
					'createTime': curTime.getTime(),
					'modifyTime': curTime.getTime(),
					'members': [],
					'path': tmpPath,
					'status': 'on',
					'type': 'dir',
					'touched': true,
					'nodes': []
				};
				currentRoot.push(newFile);
				currentRoot = newFile.nodes;
			}
		}
		flag = false;
		for (j = 0, lenj = currentRoot.length; j < lenj; ++j) {
			if (currentRoot[j].name === paths[len - 1]) {
				refreshInfo(currentRoot[j], doc);
				currentRoot[j].touched = true;
				refreshStatus(currentRoot[j]);

				if ((doc.type === "doc") && currentRoot[j].nodes) {delete currentRoot[j].nodes;}
				else if ((doc.type === "dir") && (!currentRoot[j].nodes)) {currentRoot[j].nodes = [];}
				flag = true;
				break;
			}
		}
		if (!flag) {
			var tmpObj = {
				'name': paths[len - 1],
				'status': 'off', 
				'touched': true, 
				'nodes': (doc.type === 'doc') ? null : []
			};
			refreshInfo(tmpObj, doc);
			currentRoot.push(tmpObj);
		}
	};

	var updateFiles = function(docpack) {
		var i, len, doc = docpack.doc;
		if (doc instanceof Array) {
			clearTouch({'nodes': selfRoot});
			clearTouch({'nodes': sharedRoot});
			len = doc.length;
			for (i = 0; i < len; ++i) {
				touchFile(doc[i]);
			}
			removeUntouched({'nodes': selfRoot});
			removeUntouched({'nodes': sharedRoot});
			if (rootStatus.self !== 'off') {
				rootStatus.self = 'on';
			}
			if (rootStatus.shared !== 'off') {
				rootStatus.shared = 'on';
			}
		} else {
			clearTouch(selectRoot(doc.path));
			len = doc.docs.length;
			for (i = 0; i < len; ++i) {
				touchFile(doc.docs[i]);
			}
			removeUntouched(selectRoot(doc.path));
		}
	}

	var changeFileStatus = function(path, newStatus, changePath) {
		var paths = path.split("/"), i, len, flag, currentRoot, filename;
		len = paths.length;
		if (len < 2) {
			return;
		}
		flag = (paths[1] === userModel.user.name);
		currentRoot = flag ? selfRoot : sharedRoot;
		for (i = flag ? 2 : 1; i < len - 1; ++i) {
			flag = false;
			for (j = 0, lenj = currentRoot.length; j < lenj; ++j) {
				if (currentRoot[j].name === paths[i]) {
					if (changePath) {
						currentRoot[j].status = newStatus;
					}
					currentRoot = currentRoot[j].nodes;
					flag = true;
					break;
				}
			}
			if (!flag) {
				return null;
			}
		}
		filename = paths[len - 1];
		for (j = 0, lenj = currentRoot.length; j < lenj; ++j) {
			if (currentRoot[j].name === filename) {
				currentRoot[j].status = newStatus;
				return currentRoot[j];
			}
		}
		return null;
	}

	socket.forceOn('doc', function(data) {
		updateFiles(data);
	});

	return {
		'delete': deleteRoot,
		'select': selectRoot,
		'update': updateFiles,
		'open': function(path) {changeFileStatus(path, 'on', true);},
		'close': function(path) {changeFileStatus(path, 'off', false);},
		'self': selfRoot,
		'shared': sharedRoot,
		'rootStatus': rootStatus
	};
}