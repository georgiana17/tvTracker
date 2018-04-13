"use strict"
var app = angular.module("tvTracker")
app.controller("ShowController", function($scope, $http, $routeParams, $rootScope){
    
    $scope.getPopularTvSeries = function() {
        var popularData = $http.get("/topSeries").then(function(response){
            $scope.popularSeries = response.data.results;
        });
        return popularData;
    }
    $scope.getPopularTvSeries();

    if($routeParams.id != undefined){
        $http.get("/show/" + $routeParams.id).then(function(response){
            $scope.data = response.data;
            $scope.urlImage = "https://image.tmdb.org/t/p/original" + response.data.backdrop_path;
            $scope.releaseYear = response.data.first_air_date;
            $scope.showName = response.data.name;
            $scope.posterPath = "https://image.tmdb.org/t/p/original" + response.data.poster_path;
            
            console.log($scope.data);
        });
    }

    $scope.selected = null;
    $scope.selectSeason = function(season) {
        $scope.selected = season.id;
        $http.get("/season/" + $routeParams.id + "/" + season.season_number).then(function(response){
            console.log(response.data);
        })
    }

    $scope.displayPosterPath = function(p) {
        if(p.poster_path === null) {
            return false;
        } else {
            return true;
        }

    }
});