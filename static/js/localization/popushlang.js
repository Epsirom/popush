/*!
 * Language Plugin for Popush v1.0.0
 *
 * Copyright 2013 Epsirom
 */
var popushlang = (function() {
	var lang_dict = {};
	return {
		install: function(key, dict) {
			if (typeof(dict) === "object") {
				lang_dict[key] = dict;
			}
			return this;
		},
		load: function(key) {
			return lang_dict[key];
		},
		remove: function(key) {
			lang_dict[key] = undefined;
		}
	}	
})();
