"use strict"
var app = angular.module("tvTracker")
app.controller("LoginController", function($scope, $http, $window, auth, session){
    var vm = this;
    vm.userData = "";
    console.log(session.setUser("georgy17"));
    console.log(session.getUser());
    console.log(auth.isLoggedIn());
    $scope.signin = function($scope) {
        $http.get("/users/" + Form.username.value).then(function(response){
            if(response.data.length != 0) {
                // console.log("Username " + response.data[0].username + " exists in database.");
                console.log($window.localStorage);
                $window.localStorage.setItem("storeUser", response.data[0].username);

            } else {
                console.log("Username does not exist.")
            }
        });
    }
});