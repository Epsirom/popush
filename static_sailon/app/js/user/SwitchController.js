'use strict';

function SwitchController($scope, userModel, socket, $location) {
	$scope.choice = "SIGN_IN";
	$scope.switchBtn = "SIGN_UP";
	$scope.switch = function(){
		var temp='';
		temp = $scope.choice;
		$scope.choice = $scope.switchBtn;
		$scope.switchBtn = temp;
	};
}