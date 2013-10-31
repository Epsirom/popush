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
				current = tabs[i];
				return;
			}
		}
		tabs.push({'type': 'setting', 'title': 'USER_SETTINGS'});
		current = tabs[len];
	}

	current = tabs[1];

	return {
		'tabs': tabs,
		'current': current,
		'showSettings': showSettings
	};
}