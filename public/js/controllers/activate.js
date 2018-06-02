"use strict"
var app = angular.module("tvTracker")
app.controller("ActivateController", function($scope, $http, $routeParams, $rootScope) {
    if($routeParams.token) {
        $http.get("/activate/" + $routeParams.token).then(function(res){
            console.log(res.data.message);
        })
    }
});