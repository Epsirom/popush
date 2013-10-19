'use strict';

function EditorController($scope, userModel, socket, $location) {
	$scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        indentUnit: 4,
		indentWithTabs: true,
		value: "function test()\n{\n\tvar Huarong = 'Dadi', Yanglei = 'Nanshen';\n}",
        onLoad : function(_editor){
				    // Editor part
				    var _doc = _editor.getDoc();
				    _editor.focus();

				    // Options
				    CodeMirror.modeURL = "../../lib/codemirror/mode/%N/%N.js";
				    _editor.setOption("mode", "javascript");
   					CodeMirror.autoLoadMode(_editor, "javascript");

				    // Events
				    _editor.on("beforeChange", function(){ });
				    _editor.on("change", function(){ });
				},
		gutters: ["runat", "CodeMirror-linenumbers", "breakpoints"],
    };
}