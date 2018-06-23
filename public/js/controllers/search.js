"use strict"
var app = angular.module("tvTracker")
app.controller("SearchController", function($scope, $routeParams, $http, $rootScope, userShows) {    
    if($routeParams.query != undefined) {
        $http.get("/search/" + $routeParams.query).then(function(res) {
            $scope.tvShows = res.data.results;
        });
    }
    $scope.userShows = userShows;
    // $scope.userShows = [[37680], [1399]];  // FOR UNIT TESTING

    console.log(userShows)

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