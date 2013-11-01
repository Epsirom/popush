'use strict';

function TabsModel(userModel, fileTreeModel, socket) {

	// Data
	var tabs = [
			{'type': 'room', 'title': 'Dadi.cpp', 'path':["bin","das","Dadi.cpp"]}];
	var current = null;
	var currentMembers = [];

	// Tab Services

	var updateMembers = function() {
		currentMembers.splice(0, currentMembers.length);
		if ((!current) || ((current.type != 'doc') && (current.type != 'dir'))) {
			return;
		} else {
			var i, len = current.doc.members ? current.doc.members.length : 0,
				paths = current.doc.path.split('/');
			if (paths.length == 2) {
				if (paths[1] != userModel.user.name) {
					currentMembers.push(current.doc.nodes[0].owner);
				}
				currentMembers.push(userModel.user);
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
			if (tabs[i].type === 'setting') {
				return setCurrent(i);
			}
		}
		tabs.push({'type': 'setting', 'title': 'USER_SETTINGS'});
		return setCurrent(len);
	}

	var openFolder = function(doc) {
		var i, len;
		for (i = 0, len = tabs.length; i < len; ++i) {
			if (tabs[i].title === doc.path) {
				setCurrent(i);
				return;
			}
		}
		var paths = doc.path.split("/");
		paths.splice(0, 1);
		tabs.push({'type': 'dir', 'title': doc.path, 'paths': paths, 'doc': doc});
		setCurrent(len);
	}

	var openRoom = function(doc) {
		
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
			current.title = newDoc.path;
			var paths = newDoc.path.split('/');
			paths.splice(0, 1);
			current.paths = paths;
			current.doc.viewMode = 'active';
			updateMembers();
		}
	}

	var getPath = function() {
		return current.doc.path;
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
		'getPath': getPath
	};
}