"use strict"
var app = angular.module("tvTracker")
app.controller("SearchController", function($scope, $routeParams, $http) {    
    if($routeParams.query != undefined) {
        $http.get("/search/" + $routeParams.query).then(function(res) {
            $scope.tvShows = res.data.results;
        });
    }
});