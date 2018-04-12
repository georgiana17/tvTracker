"use strict"
var app = angular.module("tvTracker")
app.controller("ShowController", function($scope, $http, $routeParams){
    $http.get("/show/" + $routeParams.id).then(function(response){
        $scope.data = response.data;
        $scope.urlImage = "https://image.tmdb.org/t/p/original" + response.data.backdrop_path;
        $scope.releaseYear = response.data.first_air_date;
        $scope.showName = response.data.name;
        $scope.posterPath = "https://image.tmdb.org/t/p/original" + response.data.poster_path;
        console.log(response.data);
    })
});