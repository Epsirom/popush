function ChatController($scope, userModel, roomModel, socket, $location, $cookies, tabsModel){
	$scope.current = tabsModel.getCurrent().room;
	$scope.show_popover = false;          //show popover tip or not

    $scope.$on('$destroy', function() {
        roomModel.leaveRoom($scope.current);
    });

	socket.onScope($scope, {
		'chat': function (data){
			var time = new Date(data.time);
			var msg = {
				'name': data.name,
				'type': data.name == userModel.user.name?'self':'',
				'content': data.text,
				'time':time.toTimeString().substr(0, 8)
			}
			$scope.current.chat.push(msg);
		}
	});

	$scope.sendChatMessage = function() {
		if ($scope.chatInput == '')
			return;
		socket.emit('chat', {
			text: $scope.chatInput
		});
		$scope.chatInput = '';
	}


	
	//voice

	var Browser = {};
	var ua = navigator.userAgent.toLowerCase();
	var s;
	(s = ua.match(/msie ([\d.]+)/)) ? Browser.ie = s[1] :
	(s = ua.match(/firefox\/([\d.]+)/)) ? Browser.firefox = s[1] :
	(s = ua.match(/chrome\/([\d.]+)/)) ? Browser.chrome = s[1] :
	(s = ua.match(/opera.([\d.]+)/)) ? Browser.opera = s[1] :
	(s = ua.match(/version\/([\d.]+).*safari/)) ? Browser.safari = s[1] : 0;

	if((!Browser.chrome || parseInt(Browser.chrome) < 18) &&
		(!Browser.opera || parseInt(Browser.opera) < 12)) {
		$scope.current.voiceOn = true;
		$scope.show_popover = true;
	}
	window.voiceon = false;
	window.voiceLock = false;
	window.userArray = [];
	window.audioArray = {};
	window.joinedARoom = false;
	window.peerArray = {};
	window.peerUserArray = [];

	function leaveVoiceRoom() {
		while(window.userArray.length > 0)
		{
			angular.element(window.audioArray[window.userArray.shift()]).remove();
		}
		
		while(window.peerUserArray.length > 0){
			var peerUName = window.peerUserArray.shift();
			if(window.peerArray[peerUName]){
				window.peerArray[peerUName].myOnRemoteStream = function (stream){
					stream.mediaElement.muted = true;
					return;
				};
			}
		}
		
		if(!window.joinedARoom){
			return;
		}
		
		//$('#voice-on').removeClass('active');
		$scope.btn_active = "";
		window.voiceConnection.myLocalStream.stop();
		window.voiceConnection.leave();
		delete window.voiceConnection;
	}

	$scope.enterVoiceRoom = function () {
		if($scope.current.voiceOn) return;
		if(window.voiceLock) return;
		window.voiceLock = true;
		window.voiceon = !window.voiceon;
		if(window.voiceon) {
			if(window.joinedARoom){
				return;
			}
			$scope.btn_active = "active green-border";
		//$('#voice-on').addClass('active');
			try{
				var username = userModel.user.name;
				var dataRef = new Firebase('https://popush.firebaseIO.com/' + $scope.current.data.id);
				dataRef.once('value',function(snapShot){
					delete dataRef;
					if (snapShot.val() == null){
						var connection = new RTCMultiConnection($scope.current.data.id);
						window.voiceConnection = connection;
						connection.session = "audio-only";
						connection.autoCloseEntireSession = true;

						connection.onstream = function (stream) {
							if ((stream.type == 'remote') && (stream.extra.username != username)) {
								stream.mediaElement.style.display = "none";
								stream.mediaElement.muted = false;
								stream.mediaElement.play();
								document.body.appendChild(stream.mediaElement);
								window.userArray.push(stream.extra.username);
								window.audioArray[stream.extra.username] = stream.mediaElement;
							}
						};
						connection.onUserLeft = function(userid, extra, ejected) {
							angular.element(window.audioArray[extra.username]).remove();
							if(window.peerArray[extra.username]){
								window.peerArray[extra.username].myOnRemoteStream = function (stream){
									stream.mediaElement.muted = true;
									return;
								};
							}
						};
						connection.connect();
						
						connection.open({
							extra: {
								username: username
							},
							interval: 1000
						});
					}
					else{
						var connection = new RTCMultiConnection($scope.current.data.id);
						window.voiceConnection = connection;
						connection.session = "audio-only";
						connection.autoCloseEntireSession = true;
						
						connection.onNewSession = function (session){
							if(window.joinedARoom){
								return;
							}
							connection.join(session, {
								username: username
							});
						};
						connection.onstream = function (stream) {
							if ((stream.type == 'remote') && (stream.extra.username != username)) {
								stream.mediaElement.style.display = "none";
								stream.mediaElement.muted = false;
								stream.mediaElement.play();
								window.userArray.push(stream.extra.username);
								window.audioArray[stream.extra.username] = stream.mediaElement;
								document.body.appendChild(stream.mediaElement);
							}
						};
						connection.onUserLeft = function(userid, extra, ejected) {
							if(ejected){
								//$('#voice-on').removeClass('active');
								$scope.btn_active = "";
								while(window.userArray.length > 0){
									angular.element(window.audioArray[window.userArray.shift()]).remove();
								}
								while(window.peerUserArray.length > 0){
									var peerUName = window.peerUserArray.shift();
									if(window.peerArray[peerUName]){
										window.peerArray[peerUName].myOnRemoteStream = function (stream){
											stream.mediaElement.muted = true;
											return;
										};
									}
								}
								delete window.voiceConnection;
								window.voiceon = !window.voiceon;
							}
							else{
								angular.element(window.audioArray[extra.username]).remove();
								if(window.peerArray[extra.username]){
									window.peerArray[extra.username].myOnRemoteStream = function (stream){
										stream.mediaElement.muted = true;
										return;
									};
								}
							}
						};
						connection.connect();
					}
				});
			}
			catch(err){
				alert(err);
			}
		} else {
			leaveVoiceRoom();
		}
	}

}