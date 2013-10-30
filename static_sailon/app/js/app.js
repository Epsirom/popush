'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('popush', ['popushFilters','socketModule', 'userModule', 'workspaceModule', 'pascalprecht.translate', 'ngCookies','ui.router','ui.codemirror']).
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

    app.directive('resize', function ($window) {
    return function (scope, element) {
        var w = angular.element($window);
        scope.getWindowDimensions = function () {
            return { 'h': w[0].innerHeight, 'w': w[0].innerWidth };
        };
        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
            scope.windowHeight = newValue.h;
            scope.windowWidth = newValue.w;
            
            scope.style = function () {
               var tmp = newValue.w - 380;
               if(tmp < 0)
                    tmp = 600;
                return { 
                    'height': (newValue.h + 0) + 'px', 
                    'width': tmp + 'px' 
                };
            };
            
        }, true);
    
        w.bind('resize', function () {
            scope.$apply();
        });
        }
    });

    app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});