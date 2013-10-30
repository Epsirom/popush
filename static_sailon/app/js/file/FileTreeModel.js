'use strict';

function FileTreeModel(userModel, socket) {
	
	// Data

	var selfRoot = [], sharedRoot = [],
		rootStatus = {'self': 1, 'shared': 0};

	// File Services

	var selectRoot = function(path) {
		var paths = path.split("/"), i, len, currentRoot, j, lenj, flag, filename, folder;
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
					if (currentRoot[j].status > 0) {
						currentRoot[j].status = 1;
					} else {
						currentRoot[j].status = 0;
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
		lenj = paths.length - 1;
		for (i = 0, len = currentRoot.length; i < len; ++i) {
			if (currentRoot[i].name === paths[lenj]) {
				if (currentRoot[i].status > 0) {
					currentRoot[i].status = 1;
				} else {
					currentRoot[i].status = 0;
				}
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
		tmpPath = flag ? "/" + paths[1] : "";
		i = flag ? 2 : 1;
		for (; i < len - 1; ++i) {
			flag = false;
			tmpPath += ("/" + paths[i]);
			for (j = 0, lenj = currentRoot.length; j < lenj; ++j) {
				if (currentRoot[j].name === paths[i]) {
					currentRoot[j].path = tmpPath;
					currentRoot[j].touched = true;
					if (currentRoot[j].status > 0) {
						currentRoot[j].status = 1;
					} else {
						currentRoot[j].status = 0;
					}
					currentRoot = currentRoot[j].nodes;
					flag = true;
					break;
				}
			}
			if (!flag) {
				var newFile = {
					'name': paths[i],
					'path': tmpPath,
					'status': 1,
					'type': 0,
					'touched': true,
					'nodes': []
				};
				currentRoot.push(newFile);
				currentRoot = newFile.nodes;
			}
		}
		flag = false;
		filename = paths[len - 1];
		tmpPath += ("/" + filename);
		for (j = 0, lenj = currentRoot.length; j < lenj; ++j) {
			if (currentRoot[j].name === filename) {
				deleteRoot(currentRoot[j]);
				currentRoot[j].type = (doc.type === "doc") ? 1 : 0;
				currentRoot[j].touched = true;
				if (currentRoot[j].status > 0) {
					currentRoot[j].status = 1;
				} else {
					currentRoot[j].status = 0;
				}
				currentRoot[j].path = tmpPath;
				if ((doc.type === "doc") && currentRoot[j].nodes) {delete currentRoot[j].nodes;}
				else if ((doc.type === "dir") && (!currentRoot[j].nodes)) {currentRoot[j].nodes = [];}
				flag = true;
				break;
			}
		}
		if (!flag) {
			currentRoot.push({
				'name': paths[len - 1],
				'path': tmpPath,
				'status': 0,
				'type': (doc.type === "doc") ? 1 : 0,
				'touched': true,
				'nodes': (doc.type === "doc") ? null : []
			});
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
			if (rootStatus.self > 0)
				rootStatus.self = 1;
			if (rootStatus.shared > 0)
				rootStatus.shared = 1;
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
		'open': function(path) {changeFileStatus(path, 1, true);},
		'close': function(path) {changeFileStatus(path, 0, false);},
		'self': selfRoot,
		'shared': sharedRoot,
		'rootStatus': rootStatus
	};
}