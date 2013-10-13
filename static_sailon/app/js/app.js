'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('popush', ['socketModule', 'userModule', 'pascalprecht.translate', 'ngCookies']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/signIn.html', controller: 'SignInController'});
    $routeProvider.when('/signUp', {templateUrl: 'partials/signUp.html', controller: 'SignUpController'});
    $routeProvider.otherwise({redirectTo: '/'});
  }]).
	config(['$translateProvider', function($translateProvider) {
		$translateProvider.useStaticFilesLoader({
	      prefix: './data/languages/locale-',
	      suffix: '.json',
	    });
	    $translateProvider.translations({
  			  POPUSH_TITLE: "Popush",
			  POPUSH_SUBTITLE: "another co-coding platform"
		});
	  //$translateProvider.useUrlLoader('data/languages/en-US.json');
	  var cookieLang='en-US';// Synchronously, you need to revise the <ng-init="lang='en-US'"> in TranslateController,index.html
	  $translateProvider.preferredLanguage(cookieLang);
  }]).
	config(['$locationProvider', function($locationProvider) {
		$locationProvider.html5Mode(true);
	}]);