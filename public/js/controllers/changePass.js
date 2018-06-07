"use strict"
var app = angular.module("tvTracker")
app.controller("ChangePassController", function($scope, $http, $rootScope){

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