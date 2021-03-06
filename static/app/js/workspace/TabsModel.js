'use strict';

function TabsModel(userModel, fileTreeModel, socket) {

	// Data
	var tabs = [];
	var current = null;
	var currentMembers = [];
	var destDoc = null;
	var roomSetCallback = null;

	userModel.logoutCallbacks.push(function() {
		clearTabs();
	});

	// Tab Services

	var updateMembers = function() {
		currentMembers.splice(0, currentMembers.length);
		if ((!current) || ((current.type != 'room') && (current.type != 'dir'))) {
			currentMembers.push(userModel.user);
			return;
		} else {
			var i, len = current.doc.members ? current.doc.members.length : 0,
				paths = current.doc.path.split('/');
			if (paths.length == 2) {
				if (paths[1] != userModel.user.name) {
					currentMembers.push(current.doc.nodes[0].owner);
				}
				currentMembers.push(userModel.user);
			} else if (current.type == 'room') {
				var obj = fileTreeModel.select(paths.slice(0, 3).join('/'));
				if (paths[1] != userModel.user.name) {
					currentMembers.push(obj.owner);
				} else {
					currentMembers.push(userModel.user);
				}
				len = obj.members ? obj.members.length : 0;
				for (i = 0; i < len; ++i) {
					currentMembers.push(obj.members[i]);
				}
				return;
			} else if (current.doc.owner) {
				currentMembers.push(current.doc.owner);
			}
			for (i = 0; i < len; ++i) {
				currentMembers.push(current.doc.members[i]);
			}
		}
	}

	fileTreeModel.tabsFn.updateMembers = updateMembers;

	var showSettings = function() {
		var i, len;
		for (i = 0, len = tabs.length; i < len; ++i) {
			if (tabs[i].type == 'setting') {
				return setCurrent(i);
			}
		}
		tabs.push({'type': 'setting', 'title': 'USER_SETTINGS'});
		return setCurrent(len);
	}

	var openFolder = function(doc) {
		var i, len;
		for (i = 0, len = tabs.length; i < len; ++i) {
			if (tabs[i].title == doc.path) {
				setCurrent(i);
				return;
			}
		}
		var paths = doc.path.split("/");
		paths.splice(0, 1);
		tabs.push({'type': 'dir', 'title': doc.path, 'paths': paths, 'doc': doc});
		setCurrent(len);
	}

	var closeTab = function(tab) {
		if (!tab) {
			return;
		}
		var i, len;
		if (tab.doc) {
			tab.doc.viewMode = 'off';
		}
		for (i = 0, len = tabs.length; i < len; ++i) {
			if (tabs[i].title == tab.title) {
				return tabs.splice(i, 1);
			}
		}
	}

	var enterRoom = function(doc, tabToClose) {
		var i, len;
		for (i = 0, len = tabs.length; i < len; ++i) {
			if (tabs[i].title == doc.path) {
				return setCurrent(i);
			}
		}
		destDoc = doc;
		roomSetCallback = function(room) {
			var paths = doc.path.split("/");
			paths.splice(0, 1);
			var tab = {'type': 'room', 'title': doc.path, 'paths': paths, 'doc': doc, 'room': room};
			closeTab(tabToClose);
			tabs.push(tab);
			setCurrent(len - ((tabToClose == undefined) ? 0 : 1));
		} 
		socket.emit('join', {
			'path': doc.path
		});
	}

	var setCurrent = function(index) {
		if (current && current.doc && (current.doc.viewMode == 'active')) {
			current.doc.viewMode = 'back';
		}
		current = tabs[index];
		current.active = true;
		if (current.doc) {
			current.doc.viewMode = 'active';
		}
		updateMembers();
	}

	var changeDoc = function(newDoc) {
		if ((current.type == 'dir') || (current.type == 'room')) {
			current.doc.viewMode = 'off';
			current.doc = newDoc;
			current.type = 'dir';
			current.title = newDoc.path;
			var paths = newDoc.path.split('/');
			paths.splice(0, 1);
			current.paths = paths;
			current.doc.viewMode = 'active';
			updateMembers();
		}
	}

	var changeTabDoc = function(tab, newDoc) {
		if ((tab.type == 'dir') || (tab.type == 'room')) {
			tab.doc.viewMode = 'off';
			tab.doc = newDoc;
			tab.type = 'dir';
			tab.title = newDoc.path;
			var paths = newDoc.path.split('/');
			paths.splice(0, 1);
			tab.paths = paths;
			tab.doc.viewMode = 'active';
			fileTreeModel.updateByObj(newDoc);
			updateMembers();
		}
	}

	var getPath = function() {
		return current.doc.path;
	}

	var clearTabs = function() {
		tabs.splice(0, tabs.length);
		current = null;
		currentMembers.splice(0, currentMembers.length);
	}

	var changePath = function(tab, index) {
		var paths = tab.doc.path.split('/');
		if (index + 2 >= paths.length) {
			return;
		}
		var newPath = paths.slice(0, index + 2).join('/'),
			obj = fileTreeModel.select(newPath);
		fileTreeModel.closeChildren(obj);
		if (index == 0) {
			fileTreeModel.updateRoot();
		} else {
			fileTreeModel.updateByObj(obj);
		}
		changeDoc(obj);
	}

	var changeTabPath = function(oldPath, newPath) {
		var i, len = tabs.length;
		for (i = 0; i < len; ++i) {
			if (tabs[i].title == oldPath) {
				return changeTabDoc(tabs[i], fileTreeModel.select(newPath));
			}
		}
	}

	return {
		'tabs': tabs,
		'current': current,
		'members': currentMembers,
		'updateMembers': updateMembers,
		'showSettings': showSettings,
		'addFolder': openFolder,
		'setCurrent': setCurrent,
		'changeDoc': changeDoc,
		'getPath': getPath,
		'getCurrent': function() {return current;},
		'clear': clearTabs,
		'enterRoom': enterRoom,
		'getDestDoc': function() {return destDoc;},
		'setDestDoc': function(doc) {destDoc = doc;},
		'changePath': changePath,
		'runRoomSetCallback': function(room) {return roomSetCallback(room);},
		'changeTabPath': changeTabPath
	};
}