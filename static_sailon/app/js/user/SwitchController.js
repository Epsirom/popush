'use strict';

function SwitchController($scope, userModel, socket, $location, $timeout) {
	$scope.lock = userModel.lock;
	$scope.loadingStatus = 'LOADING_NOW';
	$timeout(function() {$scope.loadingStatus = 'LOADING_TOO_LONG';}, 5000);
	$scope.choice = "SIGN_IN";
	$scope.switchBtn = "SIGN_UP";
	$scope.switch = function(){
		var temp = $scope.choice;
		$scope.choice = $scope.switchBtn;
		$scope.switchBtn = temp;
	};
}