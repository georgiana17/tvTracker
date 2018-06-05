"use strict"
var app = angular.module("tvTracker")
app.controller("ActivateController", function($scope, $http, $routeParams, $rootScope, $timeout, $location) {
    $scope.resendButton = false;

    if($routeParams.token) {
        $http.get("/activate/" + $routeParams.token).then(function(res) {
            if(res.data.message == "Account activated!") {
                $scope.successMessage = "Your account was activated! Redirecting ...";
                $scope.success = true;
                $timeout(function() {
                    $location.path('/login');
                }, 2000);
            } else if(res.data.message == 'Activation link has expired!') {
                $scope.errorMessage = 'Activation link has expired!';
                $scope.error = true;
                $scope.resendButton = true;
                $scope.userName = res.data.user;
            }
        });
    }

    $scope.resendActivationLink = function() {
        $http.post("/resendLink/" + $scope.userName).then(function(res){
            if(res.data == "Email successfully sent!") {
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('Error')
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
});