"use strict"
var app = angular.module("tvTracker")
app.controller("ActivateController", function($scope, $http, $routeParams, $rootScope, $timeout, $location) {
    $scope.resendButton = false;

    if($routeParams.token) {
        $http.get("/activate/" + $routeParams.token).then(function(res){
            console.log(res.data.message);
            if(res.data.message == "Account activated!") {
                $scope.successMessage = "Your account was activated! Redirecting ...";
                $scope.success = true;
                $timeout(function() {
                    $location.path('/login');
                }, 2000);
            } else if(res.data.message == 'Activation link has expired!') {
                $scope.errorMessage = 'Activation link has expired! Redirecting ...';
                $scope.error = true;
                $timeout(function() {
                    $location.path('/login');
                }, 2000);
            }
        });
    }
});