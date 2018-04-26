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

    
    $scope.getSeason = function(season_id){
        $http.get("/season/" + $routeParams.id + "/" + season_id).then(function(response){
            //TODO
            $scope.seasonData = response.data;
            $scope.seasonName = $scope.seasonData.name;
            $scope.episodes = $scope.seasonData.episodes;
        });
    }

    if($routeParams.id != undefined){
        $http.get("/show/" + $routeParams.id).then(function(response){
            $scope.data = response.data;

            // remove the "Specials" season
            if($scope.data.seasons[0].name == "Specials"){
                $scope.data.seasons = $scope.data.seasons.slice(1, $scope.data.seasons.length);
                $scope.selectSeason(1);
            } else {
                $scope.selectSeason(0);                
            }

            $scope.urlImage = "https://image.tmdb.org/t/p/original" + response.data.backdrop_path;
            $scope.releaseYear = response.data.first_air_date;
            $scope.showName = response.data.name;
            $scope.posterPath = "https://image.tmdb.org/t/p/original" + response.data.poster_path;
        });
    }

    $scope.selected = 0;
    $scope.selectSeason = function(season_no) {
        $scope.selected = season_no;
        $scope.getSeason(season_no);
    };


    $scope.displayPosterPath = function(p) {
        if(p.poster_path === null) {
            return false;
        } else {
            return true;
        }

    }
});