'use strict';

function SignUpController($scope, userModel, socket, $location, $cookies) {
	
	socket.onScope($scope, {
		'register':function(data){
			if (!data){
				
			}else if (data.err){				
				$scope.alerts = [{type:'error', msg:data.err}];

			} else{
				$scope.alerts = [{type:'success', msg:'SignupSucceed'}];
				//emit succeed, but onScope.login can't receive anything
				userModel.signed = true;
				socket.emit('login', $scope.registeruser);
				//
			}
			userModel.lock.signUp = false;	
		}
	});
	

	$scope.alerts = [];
	
	$scope.closeErr = function() {
		$scope.alerts = [];
	}

	$scope.signUpFn = function() {

		if (userModel.lock.signUp){
			return;
		}
		if (! $scope.registeruser || ! $scope.registeruser.name){
			$scope.alerts = [{type:'error', msg:'PleaseInputUsername'}];
			return;
		}
		if(!/^[A-Za-z0-9]*$/.test($scope.registeruser.name)) {
			$scope.alerts = [{type:'error', msg:'InvalidUsername'}];
			return;
		}
		if ($scope.registeruser.name.length < 6 || $scope.registeruser.name.length > 20){
			$scope.alerts = [{type:'error', msg:'UsernameLength'}];
			return;
		}
		if (! $scope.registeruser.password){
			$scope.alerts = [{type:'error', msg:'PleaseInputPassword'}];
			return;
		}
		if ($scope.registeruser.password.length > 32){
			$scope.alerts = [{type:'error', msg:'InvalidPassword'}];
			return;
		}
		if ($scope.registeruser.password != $scope.registeruser.confirmpwd){
			$scope.alerts = [{type:'error', msg:'TwoPasswordsDidNotMatch'}];
			return;
		}
		
		userModel.lock.signUp = true;
		socket.emit('register', $scope.registeruser);
	};

}