'use strict';

angular.module('docModule', ['ngCookies', 'socketModule', 'ui.bootstrap']).
	factory('docModel', ['socket', '$location', '$route', '$cookies', 'POPUSH_SETTINGS', docModel]).
	controller('RunController', ['$scope', 'docModel', 'socket', '$location', '$cookies', RunController]).
	value('languagemap', { 
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
		'xml':		'xml'
	}).
	value('modemap', {
		'c':		'text/x-csrc',
		'clj':		'text/x-clojure',
		'coffee':	'text/x-coffeescript',
		'cpp':		'text/x-c++src',
		'cs':		'text/x-csharp',
		'css':		'text/css',
		'go':		'text/x-go',
		'h':		'text/x-csrc',
		'htm':		'text/html',
		'html':		'text/html',
		'hpp':		'text/x-c++src',
		'java':		'text/x-java',
		'js':		'text/javascript',
		'json':		'application/json',
		'lisp':		'text/x-common-lisp',
		'lua':		'text/x-lua',
		'md':		'text/x-markdown',
		'pas':		'text/x-pascal',
		'php':		'application/x-httpd-php',
		'pl':		'text/x-perl',
		'py':		'text/x-python',
		'rb':		'text/x-ruby',
		'sql':		'text/x-sql',
		'tex':		'text/x-latex',
		'vbs':		'text/x-vb',
		'xml':		'application/xml'
	}).
	value('runableext', ['c', 'cpp', 'js', 'py', 'pl', 'rb', 'lua', 'java']).
	value('debugableext', ['c', 'cpp'])
;
