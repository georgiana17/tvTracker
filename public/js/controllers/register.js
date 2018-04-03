"use strict"
var app = angular.module("tvTracker")
app.controller("RegisterController", function($scope, $http, $location){
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

    // vm.userByName = vm.getByUsername("geo");

    $scope.signup = function($scope) {
        var promise = vm.getByUsername(Form.username.value).then(function(answer){
            if(answer.length >= 1) {
                console.log("User already exists in database.");
            } else {
                vm.userData = {'username': Form.username.value, 'email': Form.email.value, 'password': Form.newPassword.value};
    
                $http.post("/user", vm.userData)
                    .then(function(result){
                    },function(result) {});
                // $location.path("/login")
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

