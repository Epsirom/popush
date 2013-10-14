'use strict';

function SignInController($scope, userModel, socket, $location, $cookies) {
	if (userModel.lock.signed) {
		$location.path('/workspace');
		return;
	}
	socket.onScope($scope, {
		'login': function(data) {
			userModel.lock.signIn = false;
			if (!data) {
				return;
			} else if(data.err){
				if(data.err == 'expired') {
					delete $cookies['sid'];
				} else {
					$scope.alerts = [{type:'error', msg:data.err}];
				}
			} else {
				userModel.currentUser = data.user;
				$cookies['sid'] = data.sid;
				userModel.lock.signed = false;
				$location.path('/workspace');
			}
		},
		'unauthorized': function() {
			$scope.alerts = [{type:'error', msg:'unauthorized'}];
			userModel.lock.signed = false;
			userModel.lock.signIn = false;
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
		if (userModel.lock.signIn) {
			return;
		}
		userModel.lock.signIn = true;
		socket.emit('login', $scope.loginuser);
	};
}