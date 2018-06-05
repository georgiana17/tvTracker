"use strict"
var app = angular.module("tvTracker")
app.controller("RecommendantionsController", function($scope, $http, recommendantions, genres, $rootScope){
    console.log(recommendantions);
    console.log(genres);
    $scope.series = recommendantions;
    //TODO: recommendantions based on genres OR based on series user watches...changing sql for myshows ..adding showname on select query
});