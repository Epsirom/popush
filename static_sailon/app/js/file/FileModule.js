'use strict';

angular.module('fileModule', []).
	value('FILE_EXTENSION_MAP', { 
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
	}).
	factory('fileTreeModel', ['userModel', 'socket', FileTreeModel]).
	controller('FileTreeController', ['$scope', 'userModel', 'fileTreeModel', 'socket', 'tabsModel', FileTreeController]).
	controller('CatalogueController', ['$scope', CatalogueController]).
	controller('FileListController', ['$scope', 'tabsModel', 'userModel', 'fileTreeModel', 'FILE_EXTENSION_MAP', 'socket', 'messageModel', FileListController]);
	