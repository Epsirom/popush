'use strict';

angular.module('fileModule', ['roomModule', 'workspaceModule']).
	factory('fileTreeModel', ['userModel', 'socket', FileTreeModel]).
	controller('FileTreeController', ['$scope', 'userModel', 'fileTreeModel', 'socket', 'tabsModel', FileTreeController]).
	controller('CatalogueController', ['$scope', CatalogueController]).
	controller('FileListController', ['$scope', 'tabsModel', 'userModel', 'fileTreeModel', 'roomGlobal', 'socket', 'messageModel', 'roomModel', FileListController]);
	