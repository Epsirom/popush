'use strict';

angular.module('roomModule', ['userModule', 'socketModule', 'workspaceModule', 
	'ngCookies', 'ui.bootstrap', 'pascalprecht.translate']).
	value('roomGlobal', {
		'languagemap': { 
			'c':		'clike',
			'clj':		'clojure',
			'coffee':	'coffeescript',
			'cpp':		'clike',
			'cs':		'clike',
			'css':		'css',
			'go':		'go',
			'h':		'clike',
			'htm':		'htmlmixed',
			'html':		'htmlmixed',
			'hpp':		'clike',
			'java':		'clike',
			'js':		'javascript',
			'json':		'javascript',
			'lisp':		'commonlisp',
			'lua':		'lua',
			'md':		'markdown',
			'pas':		'pascal',
			'php':		'php',
			'pl':		'perl',
			'py':		'python',
			'rb':		'ruby',
			'sql':		'sql',
			'tex':		'stex',
			'vbs':		'vb',
			'xml':		'xml',
		},
		'winHeight': function() {
			return window.innerHeight || (document.documentElement || document.body).clientHeight;
		},
		'isFullScreen': function(cm) {
			return /\bCodeMirror-fullscreen\b/.test(cm.getWrapperElement().className);
		}
	}).
	controller('RoomController', ['$scope', 'userModel', 'socket', '$location', 'tabsModel', 'roomGlobal', RoomController]);