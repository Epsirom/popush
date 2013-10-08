'use strict';

/* Controllers */

angular.module('popush.controllers', []).
  controller('SignInController', ['$scope',function($scope) {
  	//bi-bind variables: username, password
  	$scope.signInfn = function(){
  		alert('Sign In');
  	};
  	$scope.signUpfn = function(){
  		alert('Sign Up');
  	};
  }]).
  controller('SignUpController', ['$scope',function($scope) {
    //bi-bind variables: username, password, confirmpsd
    $scope.signUpfn = function(){
      alert('Sign Up');
    };
  }]).
  controller('TranslateCtrl', ['$translate', '$scope', function ($translate, $scope) {
  $scope.changeLanguage = function (langKey) {
    $translate.uses(langKey);
  };
}]);