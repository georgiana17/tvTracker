"use strict"
var app = angular.module("tvTracker")
app.controller("LoginController", function($scope, $http){
    var vm = this;
    $scope.username = "gigi";
    $scope.password = "muschi";
    vm.userData = "";

    $scope.submit = function($scope) {
        vm.userData = {'id': 1, 'username': Form.email.value, 'password': Form.password.value};
        // if(Form.$valid){
            $http.post("/user", vm.userData)
                .then(function(result){
                    console.log("success");
                    $location.path("/login")
                },function(result) {
                    console.log("eroare");
                $scope.serverError=result;
            })
        // }
        console.log(Form.email.value+ "   " + Form.password.value);
    }
    console.log($scope.username);
});