"use strict"
var app = angular.module("tvTracker")
app.controller("ShowController", function($scope, $http, $routeParams, $rootScope, episodes){
    
    $scope.checkedEpisodes = episodes;

    $scope.getSeason = function(season_id){
        console.log(season_id)
        $http.get("/season/" + $routeParams.id + "/" + season_id).then(function(response){
            //TODO
            $scope.seasonData = response.data;
            $scope.seasonName = $scope.seasonData.name;
            $scope.episodes = $scope.seasonData.episodes;
        });
    }

    if($routeParams.id != undefined) {
        $http.get("/show/" + $routeParams.id).then(function(response) {
            //TODO: 
            $scope.data = response.data;
            console.log($scope.data);
            // remove the "Specials" season
            //TODO: if data.seasons == null 
            if($scope.data.seasons.length > 0) {
                if($scope.data.seasons[0].name == "Specials") {
                    $scope.data.seasons = $scope.data.seasons.slice(1, $scope.data.seasons.length);
                    $scope.selectSeason(1);
                } else {
                    $scope.selectSeason(1);
                }
            }
            
            // TODO: if backdrop_path == null => add a custom image.
            $scope.urlImage = "https://image.tmdb.org/t/p/original" + response.data.backdrop_path;
            $scope.releaseYear = response.data.first_air_date;
            if(response.data.name !== null) {
                $scope.showName = response.data.name;
            } else {
                $scope.showName = response.data.original_name;
            }
            // TODO: if poster_path == null => add a custom image.
            $scope.posterPath = "https://image.tmdb.org/t/p/original" + response.data.poster_path;
        });
    }

    $scope.selected = 0;
    $scope.selectSeason = function(season_no) {
        $scope.selected = season_no;
        $scope.getSeason(season_no);
    };


    $scope.displayPosterPath = function(p) {
        // TODO: add custom poster for poster_path == null
        if(p.poster_path === null) {
            return false;
        } else {
            return true;
        }

    }

    $scope.addEpisode = function(episodeId) {
        if($routeParams.id != undefined) {
            $http.post("/addEpisode/" + $rootScope.user + "/" + episodeId).then(function(response) {
                // console.log(response);
                $scope.checkedEpisodes.push([episodeId]);
                console.log($scope.checkedEpisodes);
            });
        }
    }

    $scope.checkEpisode = function(episodeId) {
        for(var i = 0; i < $scope.checkedEpisodes.length; i++){
            if(episodeId == $scope.checkedEpisodes[i][0])
                return true;
        }
    }

    $scope.deleteEpisode = function(episodeId) {
        console.log(episodeId);
        if($routeParams.id != undefined) {
            $http.post("/deleteEpisode/" + $rootScope.user + "/" + episodeId).then(function(response) {
                for(var i=0; i<$scope.checkedEpisodes.length; i++){
                    if(episodeId == $scope.checkedEpisodes[i][0]) {
                        $scope.checkedEpisodes.splice(i,1);
                    }
                }
            });
        }
    }

    // $http.post("/addShow/4779/64/georgy17").then(function(resp){
    //     console.log(resp);
    // })

    // $http.post("/addShow/4779/64/georgy17").then(function(resp){
    //     console.log(resp);
    // })

    // $http.post("/addShow/3562/45/georgy17").then(function(resp){
    //     console.log(resp);
    // })
});