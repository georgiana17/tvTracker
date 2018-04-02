"use strict"
var app = angular.module("tvTracker")
app.controller("LoginController", function($scope, $http){
    var vm = this;
    $scope.username = "gigi";
    $scope.password = "muschi";
    vm.userData = "";

    $scope.signin = function($scope) {
        vm.userData = {'id': 1, 'username': Form.email.value, 'password': Form.password.value};
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