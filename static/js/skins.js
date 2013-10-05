/**
* author: Huarong Chen
*/
var popushskin = (function(){
	var popush_skins = {};
	var mirror_editor;
	// skinsettings is like:
	// 		{"css":[selector,[css1, cssvalue],[css2,cssvalue]], "mirrortheme":themename}
	var applyskin = function(skinsettings) {
		if (typeof(skinsettings) !== "object") {
			return;
		}
		var skincss = skinsettings["css"], mirrortheme = skinsettings["mirrortheme"];
		// set css if avaliable.
		if (skincss instanceof Array) {
			var i, j, len = skincss.length, slen, $current;
			for (i = 0; i < len; ++i) {
				$current = $(skincss[i][0]);
				slen = skincss[i].length;
				for (j = 1; j < slen; ++j) {
					$current.css(skincss[i][j][0], skincss[i][j][1]);
				}
			}
		}
		// set editor theme if avaliable.
		if (mirror_editor && (typeof(mirrortheme) === "string")) {
			mirror_editor.setOption('theme', mirrortheme);
		}
	}
	return {
		set_editor: function(editor) {
			if (editor && (typeof(editor.setOption) === "function")) {
				mirror_editor = editor;
			}
			return this;
		},
		// install popush skin
		install: function(key, skincss, codemirrortheme) {
			if ((typeof(key) === "string") 
				&& (skincss instanceof Array) 
				&& (typeof(codemirrortheme) === "string")) {
				popush_skins[key] = {"css": skincss, "mirrortheme": codemirrortheme};
			}
			return this;
		},
		// uninstall popush skin
		remove: function(key) {
			popush_skins[key] = undefined;
		},
		// load popush skin to check if existed
		load: function(key) {
			return popush_skins[key];
		},
		// apple a skin to current ui
		apply: function(key) {
			applyskin(popush_skins[key]);
		}
	}
})();
// install skins right now.
popushskin.install(
	'grey', [
		['body', 
			['background', 'url(/images/skin-grey.png)'], 
			['color', 'black']
		]// here can be more css
	], "lesser-dark"	// last one is code-mirror-theme name.
).install(
	'dark', [
		['body', 
			['background', 'url(/images/skin-dark.png)'], 
			['color', 'grey']
		]// here can be more css
	], "twilight"
).install(
	'geometry', [
		['body', 
			['background', 'url(/images/skin-geometry.png)'], 
			['color', 'black']
		]// here can be more css
	], "default"
).install(
	'wood', [
		['body', 
			['background', 'url(/images/skin-wood.png)'], 
			['color', 'black']
		]// here can be more css
	], "default"
)
