'use strict';

function LanguageController($scope, userModel, $translate) {
	$scope.changeLang = function () {
	    $translate.uses($scope.lang);
	};
}