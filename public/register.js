"use strict"
var app = angular.module("tvTracker")
app.controller("RegisterController", function($scope, $http){
    var vm = this;

    $scope.signup = function($scope) {
        vm.userData = {'id': 1,'username': Form.username.value,'email': Form.email.value, 'password': Form.password.value};
        // if(Form.$valid){
            $http.post("/user", vm.userData)
                .then(function(result){
                    $location.path("/login")
                },function(result) {
                $scope.serverError=result;
            })
        // }
    }
});