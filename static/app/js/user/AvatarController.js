'use strict';

function AvatarController($scope, userModel, socket) {
    socket.onScope($scope, {
        'avatar':function(data){
            if (!data  || data.err){
                $scope.alerts = [{type:'error', msg:'ChangeAvatarFail'}];
            }else {
                userModel.user.avatar = data.url;
                //修改memberlist.refreshpopover{...}
                $scope.alerts = [{type:'success', msg:'ChangeAvatarSucceed'}];
            }
            userModel.lock.operation = false;
        }
    });

    
    $scope.currentuser = {};
    $scope.currentuser = userModel.user;
    
    $scope.alerts = [{type:'warning', msg:'ClickToChange'}];
    $scope.closeErr = function() {
        $scope.alerts = [];
    }

    $scope.changeAvatarFn = function(element){
       
            if (userModel.lock.operation)
                return;
            if (typeof FileReader === 'undefined'){
                alert('Your brower not support FileReader Interface');
            } else {

                var file = element.files[0];

                var reader = new FileReader();
                reader.onloadend = function(){
                    if (reader.error){
                        $scope.alerts = [{type:'error', msg:'ReadFileError'}];
                    } else {

                        userModel.lock.operation = true;
                        var r = reader.result;
                        var t = r.substr(r.indexOf('base64') + 7);
                        if (t.length > 0x100000){
                            $scope.alerts = [{type:'error', msg:'ImageTooLarge'}];
                        } 
                        socket.emit('avatar', {
                            type: file.type,
                            avatar: t
                        });
                    }
                }
                reader.readAsDataURL(file);
            }
    }
}