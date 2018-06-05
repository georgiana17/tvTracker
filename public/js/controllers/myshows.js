"use strict"
var app = angular.module("tvTracker")
app.controller("MyShowsController", function($scope, /* myShows, */ $http, $rootScope, $mdDialog) {
    $scope.progress = 34;
    // $scope.myShows = myShows;
    /* $scope.unfollowed = false;
    $scope.totalEpisodes = 0;
    $scope.totalEpisodesWatched = 0;
    for(var i=0; i < myShows.length; i++) {
        $scope.totalEpisodes = $scope.totalEpisodes + myShows[i][0][8];
        $scope.totalEpisodesWatched = $scope.totalEpisodesWatched + (myShows[i][0][8] - myShows[i][0][6]);
    }

    $scope.progress = Math.round(($scope.totalEpisodesWatched * 100)/$scope.totalEpisodes)

    $scope.unfollowShow = function(showId, event) {
        // console.log(event);
        event.currentTarget.className = "md-checked"; //NOT NEEDED FOR BUTTON ANYMORE
        $mdDialog.show(
            $mdDialog.confirm()
            .title('Do you want to delete from list this show? ')
            .ariaLabel('Confirm')
            .textContent('You will loose all of your tracking.')
            .targetEvent(event)
            .clickOutsideToClose(true)
            .ok('Yes')
            .cancel('No')
        ).then(function() {
            $http.post("/deleteShowFromUser/" + $rootScope.user + "/" + showId).then(function(resp){
                if(resp.data == "TV show deleted successfully!") {
                    for(var i=0; i < $scope.myShows.length; i++) {
                        if($scope.myShows[i][0][1] == showId) {
                            $scope.myShows.splice(i,1);
                        }
                    }
                }
            });  
        }, function() {
            event.currentTarget.className = ""; //NOT NEEDED FOR BUTTON ANYMORE
        });
    } */

    // $scope.checked = function(show) {
    //     for(var i = 0; i < myShows.length; i++) {
    //         if(show == myShows[i][0][1]) {
    //             return true;
    //         }
    //     }
    // }

});