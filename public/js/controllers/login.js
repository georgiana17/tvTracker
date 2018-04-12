"use strict"
var app = angular.module("tvTracker")
app.controller("LoginController", function($scope, $rootScope, $http, $window, auth, session, $mdDialog, $location, $route){
    var vm = this;
    vm.userData = "";
    $scope.signin = function($scope) {
        vm.failed = false;
        $http.get("/login/" + Form.username.value + "/" + Form.newPassword.value).then(function(response){
            if(response.data.length != 0){
                if(response.data.userData.length != 0 && response.data.passwordMatch == true) {
                    session.setUser(Form.username.value);
                    $location.path("/");
                    $rootScope.loggedIn = true;
                    $rootScope.user = Form.username.value;
                    $rootScope.update();
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
            }
        });        
    }    
});