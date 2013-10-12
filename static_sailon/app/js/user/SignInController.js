'use strict';

function SignInController($scope, userModel, socket, $location) {
	$scope.signInFn = function() {

	};
	$scope.switchSignUp = function() {
		$location.path('/signUp');
	};
}