"use strict"
var app = angular.module("tvTracker")
app.controller("MyShowsController", function($scope, myShows) {
    $scope.myShows = myShows;
    
});