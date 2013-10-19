'use strict';

function PasswordController($scope, userModel, socket) {
	socket.onScope($scope, {
		'password':function(data){
			if (!data){

			}else if (data.err){				
				$scope.alerts = [{type:'error', msg:data.err}];
			} else{
				$scope.alerts = [{type:'success', msg:'ChangePasswordSucceed'}];
			}
			console.log('m');	
			userModel.lock.operation = false;
		}
	});
	

	$scope.alerts = [];
	
	$scope.closeErr = function() {
		$scope.alerts = [];
	}

	$scope.changePasswordFn = function() {
		if (userModel.lock.operation)
			return;

		if (! $scope.currentuser || ! $scope.currentuser.password){
			$scope.alerts = [{type:'error', msg:'PleaseInputPassword'}];
			return;
		}
	
		if (! $scope.currentuser.newPassword){
			$scope.alerts = [{type:'error', msg:'PleaseInputNewPassword'}];
			return;
		}

		if ($scope.currentuser.newPassword.length > 32){
			$scope.alerts = [{type:'error', msg:'InvalidNewPassword'}];
			return;
		}
		if ($scope.currentuser.newPassword != $scope.currentuser.confirmPwd){
			$scope.alerts = [{type:'error', msg:'TwoPasswordsDidNotMatch'}];
			return;
		}

		userModel.lock.operation = true;
		socket.emit('password', $scope.currentuser);
	}
}