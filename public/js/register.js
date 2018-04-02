"use strict"
var app = angular.module("tvTracker")
app.controller("RegisterController", function($scope, $http){
    var vm = this;

    $scope.signup = function($scope) {
        vm.userData = {'username': Form.username.value,'email': Form.email.value, 'password': Form.newPassword.value};
        console.log(Form);
        $http.post("/user", vm.userData)
            .then(function(result){
                $location.path("/login")
            },function(result) {
            $scope.serverError=result;
        });
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

