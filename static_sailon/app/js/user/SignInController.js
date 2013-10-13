'use strict';

function SignInController($scope, userModel, socket, $location) {
	$scope.signInFn = function() {
		$location.path('/workspace');
	};
	$scope.switchSignUp = function() {
		//$location.path('/signUp');

	};
}