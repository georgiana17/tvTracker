"use strict"
var app = angular.module("tvTracker")
app.controller("ChangePassController", function($scope, $http, $rootScope, user, $timeout, $location, $mdDialog, $mdToast){
    console.log(user);
    $scope.changePass = function(pass){
        console.log(pass)
        $http.post("/updatePassword/" + pass + "/" + user.username).then(function(res){
            if(res.data == "Password updated successfully!"){
                $mdToast.show(
                    $mdToast
                        .simple()
                        .content("Password changed successfully!")
                        .position('bottom right')
                        .theme('custom-toast')
                        .hideDelay(4000)
                );
                $timeout(function() {
                    $location.path('/login');
                }, 2000);
            }
        })
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