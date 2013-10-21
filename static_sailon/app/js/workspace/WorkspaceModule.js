'use strict';

angular.module('workspaceModule', ['userModule', 'socketModule', 'ngCookies', 'ui.bootstrap', 'pascalprecht.translate']).
	factory('fileTreeModel', ['userModel', FileTreeModel]).
	controller('WorkspaceController', ['$scope', 'userModel', 'socket', '$cookies', '$location', WorkspaceController]).
	controller('CatalogueController', ['$scope', CatalogueController]).
	controller('FileTreeController', ['$scope', 'userModel', 'fileTreeModel', FileTreeController]);