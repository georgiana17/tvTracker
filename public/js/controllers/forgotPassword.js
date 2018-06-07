"use strict"
var app = angular.module("tvTracker")
app.controller("ForgotPassController", function($scope, $http, $rootScope){
    
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
            } else if (userData.length >= 1 &&  userData != "Email not found!") {
                $http.post("/resendPass/" +   userData.username + "/" + userData.email).then(function(res){

                })
            }
        })
    }
});