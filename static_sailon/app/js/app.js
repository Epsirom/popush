'use strict';


// Declare app level module which depends on filters, and services
angular.module('popush', ['popush.filters', 'popush.services', 'popush.directives', 'popush.controllers']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/signIn.html', controller: 'SignController'});
    $routeProvider.when('/signUp', {templateUrl: 'partials/signUp.html', controller: 'SignController'});
    $routeProvider.otherwise({redirectTo: '/'});
  }]);
