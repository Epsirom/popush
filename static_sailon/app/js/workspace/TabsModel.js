'use strict';

function TabsModel(userModel, fileTreeModel, socket) {

	// Data
	var path1 = ["bin","das","Dadi.cpp"];
    var path2 = ["bin","das"];
	var tabs = [
			{'type': 'room', 'title': 'Dadi.cpp', 'path':path1},
			{'type': 'folder', 'title': '123','path':path2},
			{'type': 'room', 'title': 'Dadi.cpp', 'path':path1}];
	var current = null;

	// Tab Services

	var showSettings = function() {
		var i, len;
		for (i = 0, len = tabs.length; i < len; ++i) {
			if (tabs[i].type === 'setting') {
				tabs[i].active = true;
				current = tabs[i];
				return;
			}
		}
		tabs.push({'type': 'setting', 'title': 'USER_SETTINGS'});
		tabs[len].active = true;
		current = tabs[len];
	}

	var openFolder = function(doc) {
		var i, len;
		for (i = 0, len = tabs.length; i < len; ++i) {
			if (tabs[i].title === doc.path) {
				tabs[i].active = true;
				current = tabs[i];
				return;
			}
		}
		var paths = doc.path.split("/");
		paths.splice(0, 1);
		tabs.push({'type': 'dir', 'title': doc.path, 'paths': paths, 'doc': doc});
		tabs[len].active = true;
		current = tabs[len];
	}

	var setCurrent = function(index) {
		current = tabs[index];
	}

	var changeDoc = function(newDoc) {
		if ((current.type == 'dir') || (current.type == 'room')) {
			current.doc = newDoc;
			current.title = newDoc.path;
			var paths = newDoc.path.split('/');
			paths.splice(0, 1);
			current.paths = paths;
		}
	}

	var getPath = function() {
		return current.doc.path;
	}

	return {
		'tabs': tabs,
		'current': current,
		'showSettings': showSettings,
		'addFolder': openFolder,
		'setCurrent': setCurrent,
		'changeDoc': changeDoc,
		'getPath': getPath
	};
}