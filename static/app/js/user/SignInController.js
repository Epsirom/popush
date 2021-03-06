'use strict';

function SignInController($scope, userModel, socket, $location, $cookies, fileTreeModel, messageModel, tabsModel) {
	if (userModel.lock.signed) {
		$location.path('/workspace');
		return;
	}
	messageModel.clear();
	socket.forceOn('login', function(data) {
		userModel.lock.signIn = false;
		if (!data) {
			return;
		} else if(data.err){
			if(data.err == 'expired') {
				delete $cookies['sid'];
				$location.path('/');
				return;
			} else {
				$scope.alerts = [{type:'error', msg:data.err}];
			}
			return;
		} else {
			userModel.user = data.user;

			fileTreeModel.update({'doc':data.user.docs});

			$cookies['sid'] = data.sid;
			messageModel.append('loginsuccess');
			tabsModel.clear();
			tabsModel.addFolder(fileTreeModel.select("/" + userModel.user.name));
			userModel.lock.signed = true;
			$location.path('/workspace');
		}
	});
	/*socket.onScope($scope, {
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
				return;
			} else {
				userModel.user = data.user;

				fileTreeModel.update({'doc':data.user.docs});

				$cookies['sid'] = data.sid;
				messageModel.clear();
				messageModel.append('loginsuccess');
				tabsModel.clear();
				tabsModel.addFolder(fileTreeModel.select("/" + userModel.user.name));
				userModel.lock.signed = true;
				$location.path('/workspace');
			}
		}
	});*/

	$scope.alerts = [];

	if (userModel.lock.relogin) {
		userModel.lock.relogin = false;
		$scope.alerts = [{type:'error', msg:'needrelogin'}];
	}

	$scope.closeErr = function() {
		$scope.alerts = [];
	}
	$scope.signInFn = function() {

		if (!$scope.loginuser || !$scope.loginuser.name || !$scope.loginuser.password) {
			$scope.alerts = [{type:'error', msg:'pleaseinput'}];
			return;
		}
		if (userModel.lock.signIn) {
			$scope.alerts = [{type:'error', msg:'signing'}];
			return;
		}
		userModel.lock.signIn = true;
		socket.emit('login', $scope.loginuser);
	};
}