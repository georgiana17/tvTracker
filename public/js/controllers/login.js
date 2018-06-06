"use strict"
var app = angular.module("tvTracker")
app.controller("LoginController", function($scope, $rootScope, $http, $window, auth, session, $mdDialog, $location, $route){
    var vm = this;
    vm.userData = "";
    $scope.signin = function($scope) {
        vm.failed = false;
        vm.notActivated = false;
        vm.userNotFound = false;
        $http.get("/login/" + Form.username.value + "/" + Form.newPassword.value).then(function(response){
            if(response.data == "User not found!") {
                vm.userNotFound = true;
            } else if(response.data != undefined && typeof response.data == "object"){
                // response.data.userStatus = 'active'; // for testing when server_mongoose.js
                if(response.data.userData.length != 0 && response.data.passwordMatch == true && response.data.userStatus == 'active') {
                    session.setUser(Form.username.value);
                    $location.path("/");
                    $rootScope.loggedIn = true;
                    $rootScope.user = Form.username.value;
                    $rootScope.update();
                } else if(response.data.userStatus == 'inactive') {
                    vm.notActivated = true;
                } else {
                    vm.failed = true;
                }
            } else {
                vm.failed = true;
            }

            if(vm.failed == true) {
                $mdDialog.show(
                    $mdDialog.alert()
                        .parent(angular.element(document.querySelector('#popupContainer')))
                        .clickOutsideToClose(true)
                        .title('Error')
                        .textContent('Username or password incorrect!')
                        .ariaLabel('Alert Dialog Demo')
                        .ok('Got it!')
                );
            } else if (vm.notActivated == true) {
                $mdDialog.show({
                    parent: angular.element(document.body),
                    clickOutsideToClose:true,
                    template:
                      '<md-dialog>' +
                      '  <md-dialog-content class="md-dialog-content">'+
                           '<div class="test"><p>Account not activated! Please check your email for activation.</p></div>'+
                      '		 <md-button ng-click="resendActivationLink()">Resend Activation</md-button> <md-button md-theme="navbar" ng-click="closeDialog();">Close</md-button>'+
                     '  </md-dialog-content>' +
                     '</md-dialog>',
                   controller: DialogController
                 });
                     
                 function DialogController($scope, $mdDialog) {
                   $scope.closeDialog = function() {
                     $mdDialog.hide();
                   };
                   $scope.resendActivationLink = function() {
                       $http.post("/resendLink/" + Form.username.value + "/" + response.data.email).then(function(res){
                           if(res.data == "Email successfully sent!") {
                            $mdDialog.show(
                                $mdDialog.alert()
                                .parent(angular.element(document.querySelector('#popupContainer')))
                                .clickOutsideToClose(true)
                                .title('Info')
                                .textContent('Email sent! Please check your email for activation.')
                                .ariaLabel('Alert Dialog Demo')
                                .ok('Got it!')
                            );
                           } else if (res.data.indexOf("Email could not sent due to error") > -1 ){
                                $mdDialog.show(
                                    $mdDialog.alert()
                                    .parent(angular.element(document.querySelector('#popupContainer')))
                                    .clickOutsideToClose(true)
                                    .title('Error')
                                    .textContent('Email not sent! Please try again later.')
                                    .ariaLabel('Alert Dialog Demo')
                                    .ok('Got it!')
                                );
                           }
                       })
                   };
                 };
            } else if (vm.userNotFound == true) {
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('Error')
                    .textContent('Username not found in database!')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('Got it!')
                );
            }
        });
    }
    
});