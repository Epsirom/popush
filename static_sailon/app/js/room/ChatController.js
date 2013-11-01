'use strict';

//appendtochatbox($.wraplocale('<span />', 'systemmessage'), 'system', data.name + '&nbsp;&nbsp;' + $.wraplocale('<span />', 'runsaprogram'), new Date(data.time));

function ChatController($scope, roomModel, socket, $location, $cookies){
	socket.onScope($scope, {
		'chat': function (data){
			
		}

	//感觉不需要把聊天内容再放到Model里面去了？因为不需要保存聊天纪录
	function sendFn () {
		if ($scope.chatInput == '')
			return;
		socket.emit('chat', {
			text: $scope.chatInput});
		$scope.chatInput = '';
	}

	function show (name, type, content, time) {
		/*
		$('#chat-show-inner').append(
		'<p class="chat-element"><span class="chat-name ' + type +
		'">' + name + '&nbsp;&nbsp;' + time.toTimeString().substr(0, 8) + '</span><br />' + content + '</p>'
		);
		var o = $('#chat-show').get(0);
		o.scrollTop = o.scrollHeight;
		*/
	}
}