'use strict';

function ConsoleController($scope, roomModel, socket, $location, $cookies){
	
	//Console input 
	//press enter to submit
	//控制台输入
	function consoleInputFn (argument) {
		if (roomModel.lock.debug || roomModel.lock.run){
			socket.emit('stdin', {
				data: $scope.consoleInput + '\n'
			})
		}
	}


}