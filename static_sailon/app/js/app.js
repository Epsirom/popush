'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('popush', ['popush.filters', 'popush.services', 'popush.directives', 'popush.controllers','pascalprecht.translate']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/signIn.html', controller: 'SignController'});
    $routeProvider.when('/signUp', {templateUrl: 'partials/signUp.html', controller: 'SignController'});
    $routeProvider.otherwise({redirectTo: '/'});
  }]).
	config(['$translateProvider', function($translateProvider) {
		$translateProvider.useStaticFilesLoader({
	      prefix: 'data/languages/',
	      suffix: '.json',
	    });
	  //$translateProvider.useUrlLoader('data/languages/en-US.json');
	  $translateProvider.preferredLanguage('en-US');
  }]);