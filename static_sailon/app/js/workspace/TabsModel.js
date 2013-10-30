'use strict';

function TabsModel(userModel, fileTreeModel, socket) {

	// Data

	var tabs = [{'type': 'folder', 'title': '123'}];
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

	var openFolder = function(doc) {
		
	}

	return {
		'tabs': tabs,
		'current': current,
		'showSettings': showSettings
	};
}