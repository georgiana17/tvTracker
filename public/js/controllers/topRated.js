"use strict"
var app = angular.module("tvTracker")
app.controller("TopRatedController", function($scope, $http, $rootScope, userShows) {
    if(userShows == "No user in database with this name!") {
        $scope.userShows = new Array();
    } else {
        $scope.userShows = userShows;
    }
    $scope.getPopularTvSeries = function() {
        var popularData = $http.get("/topSeries").then(function(response){
            $scope.popularSeries = response.data.results;
        });
        return popularData;
    }
    
    $scope.getPopularTvSeries();

    $scope.isShowFollowed = function(showId) {
        if($scope.userShows != "No shows for this user!"){
            for(var i = 0; i < $scope.userShows.length; i++) {
                if($scope.userShows[i][0] == showId) {
                    return true;
                }
            }
        } else {
            $scope.userShows = [];
        }
    };

    $scope.followShow = function(showId) {
        $http.get("/tvShow/" + showId).then(function(response){
            return response;
        }).then(function(response) {
            if(response.data == "false") {
                $http.get("/show/" + showId).then(function(res){
                    var userName =  $rootScope.user;
                    if(userName != undefined) {
                        $http.post("/addShow/" + showId + "/" + res.data.number_of_seasons + "/" + userName).then(function(res) {
                            if(res.data == "Tv Show added to Database!") {
                                $scope.userShows.push([showId]);
                            }
                        });
                    }
                });                
            } else {
                var userName =  $rootScope.user;
                if(userName != undefined) {
                    $http.post("/addShowToUser/" + userName + "/" + showId).then(function(resp){
                        if(resp.data == "TV show added to user succesfully!") {
                            $scope.userShows.push([showId]);
                        }
                    })
                }
            }
        });
    }
});