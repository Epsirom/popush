'use strict';

function LanguageController($scope, userModel, $translate) {
	$scope.lang = userModel.getLanguage();
	$scope.changeLang = function (data) {
	    $translate.uses(userModel.setLanguage($scope.lang));
	};
}