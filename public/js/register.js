"use strict"
var app = angular.module("tvTracker")
app.controller("RegisterController", function($scope, $http, $location){
    var vm = this;

    vm.getAllUsers = function($scope){
        var users = $http.get("/users").then(function(response){
            return response.data;
        });
        return users;
    };

    vm.getByUsername = function(username){
        var data = $http.get("/users/" + username).then(function(response){
            return response.data;
        });

        return data;
    };

    vm.getByUsername("test123");
    $scope.signup = function($scope) {
        vm.userByName = vm.getByUsername(Form.username.value);
        console.log(vm.userByName);
        
        if(vm.userByName.$$state.value.length != null){
            console.log("User already exists in database.")
        } else {
            vm.userData = {'username': Form.username.value,'email': Form.email.value, 'password': Form.newPassword.value};

            $http.post("/user", vm.userData)
                .then(function(result){
                },function(result) {
                $scope.serverError=result;
            });
            console.log($location.path())
            // $location.path("/login")
        }

        
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

