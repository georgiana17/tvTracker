"use strict"
var app = angular.module("tvTracker")
app.controller("RecommendantionsController", function($scope, $http, recommendantions, $rootScope, $window){
    $scope.series = recommendantions;

    if($scope.series.length != 0 ){
        if($scope.series[$scope.series.length-1].noShows != undefined){
            $scope.showByGenres = true;
        } else {
            $scope.showByGenres = false;
        }
    }

    $scope.random = function() {
        return 0.5 - Math.random();
    }
});