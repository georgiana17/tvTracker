"use strict"
var app = angular.module("tvTracker")
app.controller("SettingsController", function($scope, $http, $rootScope, $mdToast, $window, userData) {
    $scope.avoidSpoilers = (userData.avoidSpoilers == 'true');
    console.log($scope.avoidSpoilers)
    $scope.onChange = function(avoidSpoilers) {
        $http.post("/avoidSpoilers/" + avoidSpoilers + "/" + $rootScope.user).then(function(res){
            console.log(res);
        })
    };

    $scope.language = undefined;
    if(localStorage.getItem('language')){
        $rootScope.language = localStorage.getItem('language');
        $scope.language = $rootScope.language;
    }

    $scope.getSelectedLanguage = function () {
        if ($scope.language !== undefined) {
            $rootScope.language = $scope.language;
            localStorage.setItem('language', $scope.language);
            // TODO: ASSIGN TO USER in DB
            console.log($rootScope.language);
            return $scope.language;
        }
    };

    $scope.saveLanguage = function() {        
        $window.location.reload();
    }

    $scope.changePass = function(newPassword){
        $http.post("/updatePassword/" + newPassword + "/" + $rootScope.user).then(function(res){
            if(res.data == "Password updated successfully!"){
                $mdToast.show( {                   
                        template: '<md-toast class="md-toast success"> Password updated successfully!</md-toast>',
                        hideDelay: 6000,
                        position: 'bottom right'
                    }
                )
                
                // $scope.confirmPassword = "";
                // $scope.newPassword = "";
            }
        })
    }
})
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