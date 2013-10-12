'use strict';

function LanguageController($scope, userModel) {
	$scope.changeLanguage = function (langKey) {
	    $translate.uses(langKey);
	};
}