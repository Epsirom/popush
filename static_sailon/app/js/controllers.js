'use strict';

/* Controllers */

angular.module('popush.controllers', []).
	controller('TitleController', ['$scope',function($scope) {
	  	$scope.popushTitle = "Popush";
	  	$scope.popushSubTitle = "又一个协作编程平台";
  }]).
  controller('SignController', ['$scope',function($scope) {
  	//bi-bind variables: loginInputName, loginInputPassword
  	$scope.signIn = "SIGN IN";
  	$scope.username = "Username";
  	$scope.password  = "Password";
	$scope.signUp = "SIGN UP";
  	$scope.username = "Username";
  	$scope.password  = "Password";
  	$scope.confirmation  = "confirmation";
  	$scope.signInfn = function(){
  		alert('SIGN IN');
  	};
  	$scope.signUpfn = function(){
  		alert('SIGN UP');
  	};
  }]);
