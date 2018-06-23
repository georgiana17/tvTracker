"use strict"
var app = angular.module("tvTracker")
app.controller("MainController", function($scope, $http, myShows, $rootScope){
    var tvShows = [1399, 63247, 44217, 66732];
    var randImage = tvShows[Math.floor(Math.random() * tvShows.length)];
    $scope.myShows = myShows;
    $scope.hasShows = false;
    
    $scope.getBackground = function() {
        $http.get("/randomImage/" + randImage).then(function(response){
            $scope.backgroundImage = "https://image.tmdb.org/t/p/original/" + response.data.backdrop_path;
        });
    }

    console.log($scope.myShows)
    if($rootScope.loggedIn){
        if($scope.myShows == "No shows for this user!"){
            $scope.hasShows = false;
        } else {
            $scope.hasShows = true;
            
            $scope.totalEpisodes = 0;
            $scope.totalEpisodesWatched = 0;
            $scope.episodesUnwatched = 0;
            for(var i=0; i < myShows.length; i++) {
                $scope.totalEpisodes = $scope.totalEpisodes + myShows[i][0][8];
                $scope.totalEpisodesWatched = $scope.totalEpisodesWatched + (myShows[i][0][8] - myShows[i][0][6]);
                $scope.episodesUnwatched = $scope.totalEpisodes - $scope.totalEpisodesWatched;
            }
        }
    }
    
    $scope.getBackground();
})