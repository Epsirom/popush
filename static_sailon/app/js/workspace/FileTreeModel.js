'use strict';

function FileTreeModel(userModel) {
	
	// Data

	var selfRoot = [], sharedRoot = [];

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
					currentRoot = currentRoot[j].nodes;
					flag = true;
					break;
				}
			}
			if (!flag) {
				return null;
			}
		}
		for (i = 0, len = currentRoot.length; i < len; ++i) {
			if (currentRoot[i].name === paths[len - 1]) {
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
		var paths = doc.path.split("/"), i, len, currentRoot, j, lenj, flag, filename;
		len = paths.length;
		if (len < 3) {	// like "/chenhr" does not require touch.
			return;
		}
		flag = (paths[1] === userModel.user.name);
		currentRoot = flag ? selfRoot : sharedRoot;
		i = flag ? 2 : 1;
		for (; i < len - 1; ++i) {
			flag = false;
			for (j = 0, lenj = currentRoot.length; j < lenj; ++j) {
				if (currentRoot[j].name === paths[i]) {
					currentRoot[j].touched = true;
					currentRoot = currentRoot[j].nodes;
					flag = true;
					break;
				}
			}
			if (!flag) {
				var newFile = {
					'name': paths[i],
					'status': 0,
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
		for (j = 0, lenj = currentRoot.length; j < lenj; ++j) {
			if (currentRoot[j].name === filename) {
				currentRoot[j].type = (doc.type === "doc") ? 1 : 0;
				currentRoot[j].touched = true;
				if ((doc.type === "doc") && currentRoot[j].nodes) {delete currentRoot[j].nodes;}
				else if ((doc.type === "dir") && (!currentRoot[j].nodes)) {currentRoot[j].nodes = [];}
				flag = true;
				break;
			}
		}
		if (!flag) {
			currentRoot.push({
				'name': paths[len - 1],
				'status': 0,
				'type': (doc.type === "doc") ? 1 : 0,
				'touched': true,
				'nodes': (doc.type === "doc") ? null : []
			});
		}
	};

	var updateFiles = function(doc) {
		var i, len;
		if (doc instanceof Array) {
			clearTouch({'nodes': selfRoot});
			clearTouch({'nodes': sharedRoot});
			len = doc.length;
			for (i = 0; i < len; ++i) {
				touchFile(doc[i]);
			}
			removeUntouched({'nodes': selfRoot});
			removeUntouched({'nodes': sharedRoot});
		} else {
			clearTouch(selectRoot(doc.path));
			len = doc.docs.length;
			for (i = 0; i < len; ++i) {
				touchFile(doc.docs[i]);
			}
			removeUntouched(selectRoot(doc.path));
		}
	}

	var changeFileStatus = function(path, newStatus) {
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
					currentRoot[j].status = newStatus;
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

	return {
		'delete': deleteRoot,
		'select': selectRoot,
		'update': updateFiles,
		'open': function(path) {changeFileStatus(path, 1);},
		'close': function(path) {changeFileStatus(path, 0);},
		'self': selfRoot,
		'shared': sharedRoot
	};
}