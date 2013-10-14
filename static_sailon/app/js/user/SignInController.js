'use strict';

function SignInController($scope, userModel, socket, $location, $cookies) {
	socket.onScope($scope, {
		'login': function(data) {
			if (!data) {
				userModel.signed = false;
			} else if(data.err){
				if(data.err == 'expired') {
					delete $cookies['sid'];
				} else {
					$scope.alerts = [{type:'error', msg:data.err}];
				}
				userModel.signed = false;
			} else {
				userModel.currentUser = data.user;
				$cookies['sid'] = data.sid;
				$location.path('/workspace');
			}
		},
		'unauthorized': function() {
			$scope.alerts = [{type:'error', msg:'unauthorized'}];
			userModel.signed = false;
		}
	});

	$scope.alerts = [];

	$scope.closeErr = function() {
		$scope.alerts = [];
	}
	$scope.signInFn = function() {
		if (!$scope.loginuser || !$scope.loginuser.name) {
			$scope.alerts = [{type:'error', msg:'pleaseinput'}];
			return;
		}
		if (userModel.signed) {
			return;
		}
		userModel.signed = true;
		socket.emit('login', $scope.loginuser);
	};
}