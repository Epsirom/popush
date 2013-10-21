'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('popush', ['popushFilters','socketModule', 'userModule', 'pascalprecht.translate', 'ngCookies','ui.router','ui.codemirror']).
  config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");
    $stateProvider
        .state('/', {
            url: '/',
            templateUrl: 'partials/signIn.html'
        })
        .state('workspace', {
            abstract: true,
            url: '/workspace',
            templateUrl: 'partials/workspace.html'
        })
        .state('workspace.editor', {
            url: '',
            views: {
                'editor': {
                    templateUrl: 'partials/editor.html'
                },
                'catalogue': {
                    templateUrl: 'partials/catalogue.html'
                },
                'collaborators': {
                    templateUrl: 'partials/collaborators.html'
                },
                'message':{
                    templateUrl: 'partials/message.html'
                }
            }
        })
        .state('workspace.userinfo',{
            abstract: true,
            url: '/userinfo',
            views: {
                'editor': {
                    templateUrl: 'partials/userinfo.html'
                },
                'catalogue': {
                    templateUrl: 'partials/catalogue.html'
                },
                'collaborators': {
                    templateUrl: 'partials/collaborators.html'
                },
                'message':{
                    templateUrl: 'partials/message.html'
                }
            }
        })
        .state('workspace.userinfo.settings',{
            url: '',
            views: {
                '': {
                    templateUrl: 'partials/settings.html'
                }
            }
        })
        .state('workspace.userinfo.avatarMgt',{
            url: '/avatarMgt',
            views: {
                '': {
                    templateUrl: 'partials/avatarMgt.html'
                }
            }
        })
        .state('workspace.userinfo.passwordMgt',{
            url: '/passwordMgt',
            views: {
                '': {
                    templateUrl: 'partials/passwordMgt.html'
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
			  POPUSH_SUBTITLE: "Another co-coding platform"
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