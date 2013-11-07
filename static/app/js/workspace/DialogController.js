'use strict';

function DlgController($scope, $modal) {

  $scope.shareManage = function (filename, type, members) {

    var modalInstance = $modal.open({
      templateUrl: 'share.html',
      controller: ShareController,
      backdrop: 'static',
      keyboard: false,
      resolve: {
        filename: function () {
          return filename;
        },
        filetype: function () {
          return type;
        },
        userlist: function() {
          return members;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    });
  };
};

function ShareController ($scope, $modalInstance, filename, filetype, userlist, socket, userModel, tabsModel, messageModel) {

  $scope.selectedUser = '';
  $scope.userlist = userlist;
  $scope.username = '';
  $scope.selectedId = '';

  $scope.fileName = filename;
  $scope.fileType = (filetype == 'file')?'FILE':'FOLDER';

  socket.onScope($scope, {
    'share':function(data){
      userModel.lock.share = false;  
      if (data.err){        
        messageModel.append('shareErr:' + data.err);
      } else{
        $scope.userlist.push({
          'name': $scope.username,
          'avatar': data.avatar
        }); 
        messageModel.append('ADDCOLSUCCESS');
      }
    },
    'unshare':function(data){
      userModel.lock.unshare = false;  
      if (data.err){        
        messageModel.append('shareErr:' + data.err);
      } else{
        $scope.userlist.splice($scope.selectedId,1);
        console.log($scope.selectedId);
        messageModel.append('DELETECOLSUCCESS');
      }
    }    
  });


  $scope.share = function(username){
    $scope.username = username;
    if(userModel.lock.share)
     return;
    userModel.lock.share = true;

    socket.emit('share', {
      'path': tabsModel.getPath() + '/' + filename,
      'name': username
    });
  };

  $scope.unshare = function(index){
    if(userModel.lock.unshare)
     return;
    userModel.lock.unshare = true;

    socket.emit('unshare', {
      'path': tabsModel.getPath() + '/' + filename,
      'name': $scope.selectedUser
    });
  };

  $scope.select = function(username, index){
    $scope.selectedId = index;
    if($scope.selectedUser == username)
      $scope.selectedUser = '';
    else
      $scope.selectedUser = username;
  };

  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

};