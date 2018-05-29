"use strict"
var app = angular.module("tvTracker")
app.controller("MyShowsController", function($scope, myShows, $http, $rootScope) {
    $scope.myShows = myShows;
    console.log($scope.myShows);

    $scope.unfollowShow = function(showId){
        $http.post("/deleteShowFromUser/" + $rootScope.user + "/" + showId).then(function(resp){
            if(resp.data == "TV show deleted successfully!") {
                // $scope.followed = false;
                // TODO: delete from myShows
                console.log(resp.data);
            }
        })
    }
});