"use strict"
var app = angular.module("tvTracker")
app.controller("RegisterController", function($scope, $http, $location, $mdDialog, $timeout, $mdToast){
    var vm = this;

    vm.getAllUsers = function($scope){
        var users = $http.get("/users", {timeout: 3000}).then(function(response){
            return response.data;
        });
        return users;
    };

    vm.getByUsername = function(username){
        var data = $http.get("/users/" + username, {timeout: 3000}).then(function(response){
            return response.data;
        });

        return data;
    };

    vm.getByEmail = function(email){
        var data = $http.get("/email/" + email, {timeout: 3000}).then(function(response){
            return response.data;
        });

        return data;
    };

    // vm.userByName = vm.getByUsername("geo");

    $scope.signup = function($scope) {
        var promise = vm.getByUsername(Form.username.value).then(function(answer){
            if(answer.length >= 1) {
                $mdDialog.show(
                    $mdDialog.alert()
                      .parent(angular.element(document.querySelector('#popupContainer')))
                      .clickOutsideToClose(true)
                      .title('Error')
                      .textContent('User already exists in database.')
                      .ariaLabel('Alert Dialog Demo')
                      .ok('Got it!')
                  );
            } else {
                var promise = vm.getByEmail(Form.email.value).then(function(response){
                    if (response.length >= 1) {
                        $mdDialog.show(
                            $mdDialog.alert()
                              .parent(angular.element(document.querySelector('#popupContainer')))
                              .clickOutsideToClose(true)
                              .title('Error')
                              .textContent('Email already used.')
                              .ariaLabel('Alert Dialog Demo')
                              .ok('Got it!')
                          );
                    } else {
                        vm.userData = {'username': Form.username.value, 'email': Form.email.value, 'password': Form.newPassword.value};
    
                        $http.post("/user", vm.userData)
                            .then(function(result){
                                if(result.data == "Email successfully sent!"){
                                    $mdToast.show(
                                        $mdToast
                                          .simple()
                                          .content("Please check your email for confirmation! Redirecting...")
                                          .position('bottom left')
                                          .hideDelay(4000)
                                      );
                                    $timeout(function() {
                                        $location.path('/login');
                                    }, 3000);
                                }                               
                            },function(result) {});
                        // $location.path("/login")
                    }
                });                
            }
        });
    }

});

app.directive("pwCheck", function() {
    return {
        require: 'ngModel',
            link: function (scope, elm, attrs, ngModel) {
                ngModel.$validators.noMatch = function (value) {
                    // Return true if either of the passwords have not been provided yet
                    if (!attrs.pwCheck || !value) {
                        return true;
                    }
                
                    return value === attrs.pwCheck;
                }
            }
    };
})

