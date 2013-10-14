'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('popush', ['socketModule', 'userModule', 'pascalprecht.translate', 'ngCookies','ui.router']).
  config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('/', {
            url: '/',
            views: {
                "index": {
                    templateUrl: 'partials/signIn.html'
                }
            }
        })
        .state('workspace', {
            url: '/workspace',
            views: {
                "index": {
                    templateUrl: 'partials/workspace.html'
                },
                "editor": {
                    templateUrl: 'partials/editor.html'
                },
                "catalogue": {
                    templateUrl: 'partials/catalogue.html'
                }
            }
        })
    }).
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
	  	//var cookieLang='en-US';// Synchronously, you need to revise the <ng-init="lang='en-US'"> in TranslateController,index.html
	  	//$translateProvider.preferredLanguage(cookieLang);
  }]).
	config(['$locationProvider', function($locationProvider) {
		$locationProvider.html5Mode(true);
	}]).
	run(['$translate', 'userModel', function($translate, userModel) {
		$translate.uses(userModel.getLanguage());
	}]);