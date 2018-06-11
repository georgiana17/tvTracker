"use strict"
var app = angular.module("tvTracker")
app.controller("MainController", function($scope, $http){
    var tvShows = [1399, 63247, 44217, 66732];
    var randImage = tvShows[Math.floor(Math.random() * tvShows.length)]
    $scope.getBackground = function() {
        $http.get("/randomImage/" + randImage).then(function(response){
            $scope.backgroundImage = "https://image.tmdb.org/t/p/original/" + response.data.backdrop_path;
        });
    }

    $scope.getBackground();
})