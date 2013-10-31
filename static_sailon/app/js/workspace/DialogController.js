function DlgController($scope, $modal, $log) {

  $scope.open = function () {

    var modalInstance = $modal.open({
      templateUrl: 'deletion.html',
      controller: ModalInstanceCtrl,
      resolve: {
        items: function () {
          return;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    });
  };
};

function ModalInstanceCtrl ($scope, $modalInstance, items) {

  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

};