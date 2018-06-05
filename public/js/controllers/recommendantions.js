"use strict"
var app = angular.module("tvTracker")
app.controller("RecommendantionsController", function($scope, $http, recommendantions, $rootScope){
    console.log(recommendantions);
    $scope.series = recommendantions;
});