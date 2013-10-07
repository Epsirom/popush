'use strict';

/* Controllers */

angular.module('popush.controllers', []).
	controller('TitleController', ['$scope',function($scope) {
	  	$scope.popushTitle = "Popush";
	  	$scope.popushSubTitle = "只是另外一个协作编程平台";
  }]).
  controller('SignController', ['$scope',function($scope) {
  	//bi-bind variables: loginInputName, loginInputPassword
  	$scope.signIn = "Sign In";
  	$scope.username = "Username";
  	$scope.password  = "Password";
	$scope.signUp = "Sign Up";
  	$scope.username = "Username";
  	$scope.password  = "Password";
  	$scope.confirmation  = "Confirm Password";
  	$scope.signInfn = function(){
  		alert('Sign In');
  	};
  	$scope.signUpfn = function(){
  		alert('Sign Up');
  	};
  }]);
