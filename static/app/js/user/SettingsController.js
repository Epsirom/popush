'use strict';

function SettingsController($scope, userModel, $translate) {
	$scope.setting_type = 'language';
	$scope.switch_setting = function(newSetting) {
		$scope.setting_type = newSetting;
	}
}