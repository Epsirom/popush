'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('popush', ['popush.filters', 'popush.services', 'popush.directives', 'popush.controllers']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/signIn.html', controller: 'SignController'});
    $routeProvider.when('/signUp', {templateUrl: 'partials/signUp.html', controller: 'SignController'});
    $routeProvider.otherwise({redirectTo: '/'});
  }]);

app.module('popush', ['pascalprecht.translate']);

app.config(function ['$translateProvider', ($translateProvider) {
  $translateProvider.translations({
    HEADLINE: 'Hello there, This is my awesome app!',
    INTRO_TEXT: 'And it has i18n support!'
  });
}]);