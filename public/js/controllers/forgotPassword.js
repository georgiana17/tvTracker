"use strict"
var app = angular.module("tvTracker")
app.controller("ForgotPassController", function($scope, $http, $rootScope, $mdDialog, $timeout, $location, $mdToast){
    
    $scope.sendEmail = function(email){
        $http.get("/email/" + email, {timeout: 3000}).then(function(response){
            var userData = response.data;
            return userData;
        })
        .then(function(userData){
            if(userData == "Email not found!"){
                $mdDialog.show(
                    $mdDialog.alert()
                      .parent(angular.element(document.querySelector('#popupContainer')))
                      .clickOutsideToClose(true)
                      .title('Error')
                      .textContent('Email not found!')
                      .ariaLabel('Alert Dialog Demo')
                      .ok('Got it!')
                  );
            } else {
                $http.post("/resendPass/" +   userData.username + "/" + userData.email).then(function(res){
                    if(res.data == "Email successfully sent!"){
                        $mdToast.show(
                            $mdToast
                                .simple()
                                .content("Please verify your email to reset your password.")
                                .position('bottom right')
                                .theme('custom-toast')
                                .hideDelay(4000)
                        );
                        $timeout(function() {
                            $location.path('/login');
                        }, 2000);
                    } else {
                        $mdDialog.show(
                            $mdDialog.alert()
                              .parent(angular.element(document.querySelector('#popupContainer')))
                              .clickOutsideToClose(true)
                              .title('Error')
                              .textContent('Error encountered.')
                              .ariaLabel('Alert Dialog Demo')
                              .ok('Got it!')
                          );
                    }
                })
            }
        })
    }
})