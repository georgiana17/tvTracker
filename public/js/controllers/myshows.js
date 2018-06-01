"use strict"
var app = angular.module("tvTracker")
app.controller("MyShowsController", function($scope, myShows, $http, $rootScope, $mdDialog) {
    $scope.myShows = myShows;
    console.log($scope.myShows);

    $scope.unfollowShow = function(showId, event){
        
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
            console.log($scope.myShows);
            $http.post("/deleteShowFromUser/" + $rootScope.user + "/" + showId).then(function(resp){
                if(resp.data == "TV show deleted successfully!") {
                    // TODO: delete from myShows
                    console.log($scope.myShows);
                    for(var i=0; i < $scope.myShows.length; i++) {
                        if($scope.myShows[i][0][1] == showId) {
                            $scope.myShows.splice(i,1);
                            console.log($scope.myShows);
                        }
                    }
                }
            });
        }, function() {
            
        });
    }
});