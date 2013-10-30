'use strict';

angular.module('fileModule', []).
	factory('fileTreeModel', ['userModel', 'socket', FileTreeModel]).
	controller('FileTreeController', ['$scope', 'userModel', 'fileTreeModel', 'socket', '$timeout', FileTreeController]).
	controller('CatalogueController', ['$scope', CatalogueController]);
	