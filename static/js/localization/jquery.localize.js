/*!
 * jQuery Localize Plugin for Popush v1.0.0
 *
 * Copyright 2013 Epsirom
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as anonymous module.
		define(['jquery'], factory);
	} else {
		// Browser globals.
		factory(jQuery);
	}
}(function ($) {
	var locale_dict = {};
	// load locale dict and apply to ui.
	$.load_dict = function(dict) {
		if (typeof(dict) === "object")
			locale_dict = dict;
		return $("[localization]").locale();
	};
	// wrap rawHTML with localization options and return string of HTML.
	$.wraplocale = function(rawHTML, key, place, extra) {
		return $("<div/>").html($(rawHTML).setlocale(key, place, extra)).html();
	}
	// set locale options to jQuery objects.
	$.fn.setlocale = function(key, place, extra) {
		if (typeof(key) === "string") {
			this.attr('localization', key);
			if (typeof(place) === "string") {
				this.attr('localization-place', place);
			}
			if (typeof(extra) === "string") {
				this.attr('localization-extra', extra);
			}
			this.locale();
		}
		return this;
	};
	// locale jQuery objects.
	// word is optional, this function will return locale result of word if given.
	$.fn.locale = $.locale = function(word) {
		if ((!this.attr) || (!this.html) || (!this.each)) {
			return locale_dict[word];
		}
		this.each(function() {
			$this = $(this);
			var key = $this.attr('localization');
			if (key !== undefined) {
				var place = $this.attr('localization-place');
				var extra = $this.attr('localization-extra');
				var keyresult = "";
				var keys = key.split('|');
				var len = keys.length;
				var i, tmpresult;
				for (i = 0; i < len; ++i) {
					tmpresult = locale_dict[keys[i]];
					keyresult += (tmpresult === undefined ? "" : tmpresult);
				}
				var result = ((keyresult.length === 0) ? key : keyresult) + ((typeof(extra) === "string") ? extra : "");
				if (place === undefined) {
					$this.html(result);
				} else {
					$this.attr(place, result);
				}
			}
		})
		
		return locale_dict[word];
	};

}));
