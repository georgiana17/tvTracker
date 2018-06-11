"use strict"
var app = angular.module("tvTracker")
app.controller("MyShowsController", function($scope, myShows,  $http, $rootScope, $mdDialog, $mdToast) {
    // $scope.progress = 34;
    $scope.myShows = myShows;
    if($scope.myShows == "No shows for this user!"){
        $scope.hasShows = false;
    } else {
        $scope.hasShows = true;
        $scope.unfollowed = false;
        $scope.totalEpisodes = 0;
        $scope.totalEpisodesWatched = 0;
        for(var i=0; i < myShows.length; i++) {
            $scope.totalEpisodes = $scope.totalEpisodes + myShows[i][0][8];
            $scope.totalEpisodesWatched = $scope.totalEpisodesWatched + (myShows[i][0][8] - myShows[i][0][6]);
        }

        $scope.progress = Math.round(($scope.totalEpisodesWatched * 100)/$scope.totalEpisodes)

        $scope.unfollowShow = function(showId, event) {
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
            });
        }

        $scope.showInfo = function(show){
            console.log(show);
            $mdToast.show({
                position    : 'center center',
                controller  : ToastCtrl,
                templateUrl : 'public/templates/template-toast-myShows.html',
                locals: show,
                hideDelay: false,
                clickOutsideToClose: true
            });
            function ToastCtrl($scope, $mdToast){
                $scope.event = show;
                
                $scope.closeToast = function() {                    
                    $mdToast
                      .hide()
                };
            }
        }
    }
});