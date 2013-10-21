'use strict';

function DocModel(socket, $location, $route, POPUSH_SETTINGS) {
	
	var connected = false, 
		currentDoc = {},
		lock = {'run':false, 'debug':false},
		state = 0; //editing = 0, running = 1, debugging = 2

	var runable = true, 
		runableext = [
		'c', 'cpp', 'js', 'py', 'pl', 'rb', 'lua', 'java'
		],
		debugable = true,
		debugableext = [
		'c', 'cpp'
		];

	//Do we need the Socket Services here?


}