"use strict"
var app = angular.module("tvTracker")
app.controller("ShowController", function($scope, $http, $routeParams, $rootScope, episodes, rating, $mdDialog, $filter, isShowFollowed){
    $scope.checkedEpisodes = episodes;
    $scope.marked = false;
    $scope.unmarked = false;
    $scope.currentDate = $filter('date')(new Date(), 'yyyy-MM-dd');
    if(isShowFollowed != "No show for this user!" && $rootScope.loggedIn){        
        $scope.followed = isShowFollowed.followed;
    } else {
        $scope.followed = false;
    }

    if(rating) {
        $scope.vote = rating.showRating;
    } else { 
        $scope.vote = 0;
    }

    $scope.onRating = function(rating){
        $http.post("/rateShow/" + rating + "/" + $rootScope.user + "/" + $routeParams.id).then(function(res){
            console.log(res);
        }) 
    }
    
    $scope.isMarked = function() {
        if($scope.followed == true) {
            let n = 0;
            let episodesToAppear = 0;
            for(var i=0; i< $scope.seasonData.episodes.length; i++) {
                for(var j=0; j<$scope.checkedEpisodes.length; j++) {
                    if($scope.seasonData.episodes[i].id == $scope.checkedEpisodes[j].id) {
                        n++;
                    }
                }
                if($scope.seasonData.episodes[i].air_date >= $scope.currentDate){
                    episodesToAppear ++;
                }
            }
            if(n == $scope.seasonData.episodes.length - episodesToAppear) {
                $scope.marked = true;
                $scope.unmarked = true;
            } else {
                $scope.marked = false;
                $scope.unmarked = false;
            }
        }
    }

    $scope.getSeason = function(season_id) {
        $http.get("/season/" + $routeParams.id + "/" + season_id).then(function(response){
            //TODO
            $scope.seasonData = response.data;
            $scope.seasonName = $scope.seasonData.name;
            $scope.episodes = $scope.seasonData.episodes;
            
            $scope.isMarked();
        });
    }

    $scope.selected = 0;
    $scope.selectSeason = function(season_no) {
        $scope.selected = season_no;
        $scope.getSeason(season_no);
    };

    if($routeParams.id != undefined) {
        $http.get("/show/" + $routeParams.id).then(function(response){
            $scope.data = response.data;
            // remove the "Specials" season
            //TODO: if data.seasons == null 
            if($scope.data.seasons){
                if($scope.data.seasons.length > 0) {
                    if($scope.data.seasons[0].name == "Specials") {
                        $scope.data.seasons = $scope.data.seasons.slice(1, $scope.data.seasons.length);
                        $scope.selectSeason(1);
                    } else {
                        $scope.selectSeason(1);
                    }
                }
            }
            
            if($scope.data.backdrop_path == null) {
                $scope.urlImage = "public/images/logo_episode_spy_original_207x35_black_1_1663x450.png"; // CHANGE PHOTO DIMENSION
            } else {
                $scope.urlImage = "http://image.tmdb.org/t/p/original" + $scope.data.backdrop_path;
            }
            if($scope.data.first_air_date) {
                $scope.releaseYear = $scope.data.first_air_date;
            }
            if($scope.data.name !== null) {
                $scope.showName = $scope.data.name;
            } else {
                $scope.showName = $scope.data.original_name;
            }
            // TODO: if poster_path == null => add a custom image.
            if($scope.data.poster_path == null){
                $scope.posterPath = "public/images/eye.png"
            } else {
                $scope.posterPath = "http://image.tmdb.org/t/p/w154" + $scope.data.poster_path;
            }
    
            if($rootScope.loggedIn) {
                if($scope.checkedEpisodes.length != 0) {
                    $scope.progress = Math.round(($scope.checkedEpisodes.length * 100)/$scope.data.number_of_episodes);
                } else {
                    $scope.progress = 0;
                }
    
            }
            if($scope.data.videos != undefined){
                if($scope.data.videos.results.length != 0) {
                    $scope.youtubeUrl = "https://www.youtube.com/watch?v=" + $scope.data.videos.results[0].key;
                    $scope.trailer = true;
                } else {
                    $scope.trailer = false;
                }
            }
    
            if($scope.data.external_ids != undefined){
                if($scope.data.external_ids.imdb_id) {
                    $scope.imdbUrl = "https://www.imdb.com/title/" + $scope.data.external_ids.imdb_id;
                    $scope.imdb = true;
                } else {
                    $scope.imdb = false;
                }
            }
        })
    }
    
    $scope.followShow = function(showId) {
        $http.get("/tvShow/" + showId).then(function(response) {
            return response;
        }).then(function(response) {
            if(response.data == "false") {
                $http.get("/show/" + showId).then(function(res){
                    var userName =  $rootScope.user;
                    if(userName != undefined) {
                        $http.post("/addShow/" + showId + "/" + res.data.number_of_seasons + "/" + userName).then(function(res) {
                            if(res.data == "Tv Show added to Database!") {
                                $scope.followed = true;
                            }
                        });
                    }
                });                
            } else {
                $http.post("/addShowToUser/" + $rootScope.user + "/" + showId).then(function(resp){                    
                    if(resp.data == "TV show added to user succesfully!") {
                        $scope.followed = true;
                    }
                })
            }
        });
    }

    $scope.unfollowShow = function(showId) {
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
                    $scope.followed = false;
                }
            });  
        }, function() {
        });
    }

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
                $scope.checkedEpisodes.push({id: episodeId});
                $scope.isMarked();
                
                if($scope.data.number_of_episodes == $scope.checkedEpisodes.length){
                    $scope.progress = 100;
                } else {
                    $scope.progress = Math.round(($scope.checkedEpisodes.length * 100)/$scope.data.number_of_episodes);
                }
                console.log($scope.checkedEpisodes.length);
            });
        }
    }

    $scope.checkEpisode = function(episodeId) {
        if($scope.followed == true) {
            for(var i = 0; i < $scope.checkedEpisodes.length; i++){
                if(episodeId == $scope.checkedEpisodes[i].id)
                    return true;
            }
        }
    }

    $scope.deleteEpisode = function(episodeId) {
        if($routeParams.id != undefined) {
            $http.post("/deleteEpisode/" + $rootScope.user + "/" + episodeId).then(function(response) {
                for(var i=0; i<$scope.checkedEpisodes.length; i++){
                    if(episodeId == $scope.checkedEpisodes[i].id) {
                        $scope.checkedEpisodes.splice(i,1);
                    }
                }
                $scope.progress = Math.round(($scope.checkedEpisodes.length * 100)/$scope.data.number_of_episodes);
                console.log($scope.checkedEpisodes.length);
            });
        }
        $scope.marked = false;
    }

    $scope.markSeason= function() {
        for(var i = 0; i < $scope.seasonData.episodes.length; i++) {
            if($scope.seasonData.episodes[i].air_date <= $scope.currentDate) {
                $http.post("/addEpisode/" + $rootScope.user + "/" + $scope.seasonData.episodes[i].id).then(function(response) {
                });
            }
            $scope.exists = false;
            for(var j = 0; j < $scope.checkedEpisodes.length; j++){
                if($scope.checkedEpisodes[j].id == $scope.seasonData.episodes[i].id){
                    $scope.exists = true;
                }
            } 
            
            if($scope.exists == true){
                continue;
            } else {
                if($scope.seasonData.episodes[i].air_date <= $scope.currentDate){
                    $scope.checkedEpisodes.push({id: $scope.seasonData.episodes[i].id});
                }
            }
        }
        console.log($scope.checkedEpisodes.length);
        $scope.progress = Math.round(($scope.checkedEpisodes.length * 100)/$scope.data.number_of_episodes);
        $scope.marked = true;
    }

    $scope.unMarkSeason = function() {
        for(var i = 0; i < $scope.seasonData.episodes.length; i++) {
            if($scope.seasonData.episodes[i].air_date <= $scope.currentDate) {
                $scope.deleteEpisode($scope.seasonData.episodes[i].id);
            }
        }
        console.log($scope.checkedEpisodes.length);
        $scope.unmarked = true;
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