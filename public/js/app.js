"use strict"
var app = angular.module("tvTracker",['ngMaterial','ngMdIcons','ngRoute','ngMessages', 'ui.calendar', 'jkAngularRatingStars'])
app.controller("AppController", function($scope, $http, $mdSidenav, $mdDialog, $location, $rootScope, $routeParams, auth, session, $window) {
    $scope.appName = "TvTracker";
    $rootScope.loggedIn = false;
    $scope.focusInput = false;

    $rootScope.getUser = function() {
        if(auth.isLoggedIn()){
            $rootScope.user = JSON.parse(session.getUser());
            $rootScope.loggedIn = true;
        }
    }

    if(localStorage.getItem('language')){
        $rootScope.language = localStorage.getItem('language');
    }

    if($rootScope.language != undefined){
        if($rootScope.language == "Francais"){
            $rootScope.locale = 'fr';
        } else if($rootScope.language == "Romana"){
            $rootScope.locale = 'ro';
        }
        if($rootScope.locale != undefined){
            $scope.localeUrl = "node_modules/fullcalendar/dist/locale/" + $rootScope.locale + ".js";
            $("<script>").attr({src: $scope.localeUrl}).appendTo("body");
            console.log($scope.localeUrl);
        }
    }

    $scope.signout = function() {
        if($mdSidenav('left').isOpen() && $mdSidenav('left').isLockedOpen() == false){
            $scope.toggleSidenav('left');
        }
        session.destroy();
        $location.path("/");
        $rootScope.loggedIn = false;
        $rootScope.user = "";
        $rootScope.update();
    }

    angular.element($window).bind('resize', function () {
        if($window.innerWidth < 1280) {
            $scope.endSearch();
        }
    });
    
    $rootScope.getUser();

    $scope.getPopularTvSeries = function() {
        var popularData = $http.get("/topSeries").then(function(response){
            $scope.popularSeries = response.data.results;
        });
        return popularData;
    }
    
    $scope.getPopularTvSeries();


    $scope.search = null;
    $scope.sideNavSearch = null;
    $scope.preSearchToolbar = function() {
        return $scope.search == null;
    }
    $scope.showSearchToolbar = function() {
        return $scope.search != null;
    }
    $scope.initiateSearch = function() {
        $scope.focusInput = true;
        $scope.search = '';
    }
    $scope.endSearch = function() {
        $scope.focusInput = false;
        $scope.search = null;
    }
    $scope.searchTvShow = function() {
        $scope.toggleSidenav('left');
        if(($scope.search != null &&  $scope.search !== undefined) && $scope.search != "") {
            $location.path("/search/" + $scope.search);
        } else if(($scope.sideNavSearch != null && $scope.sideNavSearch !== undefined) && $scope.sideNavSearch != "") {
            $location.path("/search/" + $scope.sideNavSearch);
        }
    }

    if($routeParams.query !== null) {
        $scope.search = $routeParams.query;
    }

    $scope.$watch(function(){
            return $scope.focusInput;
        }, function(newVal, oldVal){
          if(newVal == true ){
              $('.search-input').focus();
          }
    });

    $scope.toggleSidenav = function(menuId) {
        $mdSidenav(menuId).toggle();   };


    $rootScope.update = function() {
        $scope.menuItems = [
            {
                link: '/',
                title: 'Home',
                icon: 'home',
                logged: true
            },
            {
                link: '#/myShows',
                title: 'My TV Shows',
                icon: 'favorite',
                logged: $rootScope.loggedIn
            },
            {
                link: '#/calendar',
                title: 'Calendar',
                icon: 'date_range',
                logged: $rootScope.loggedIn
            },
            {
                link: '#/calendar',
                title: 'Try Out Calendar',
                icon: 'date_range',
                logged: !$rootScope.loggedIn
            }
        ]
        $scope.userItems = [
            {
                link: '#/topSeries',
                title: 'Top Series',
                icon: 'star',
                logged: true
            },
            {
                link: '#/recommendantions',
                title: 'Recommendations',
                icon: 'thumb_up',
                logged: $rootScope.loggedIn
            },
            {
                link: '#/login',
                title: 'Login/Sign up',
                icon: 'login',
                logged: !$rootScope.loggedIn
            }
        ]
        
    }
    
    $rootScope.update();
})

app.directive('focusMe', function () {
    return {
        link: function(scope, element, attrs) {
            scope.$watch(attrs.focusMe, function(value) {
                if(value === true) {
                    element[0].focus();
                    element[0].select();
                }
            });
        }
    };
});

app.config(function($mdThemingProvider, $mdIconProvider, $routeProvider, $locationProvider) {
    $mdThemingProvider.theme('navbar')
      .primaryPalette('teal')
    //   .accentPalette('grey')
      .accentPalette('purple')
      .backgroundPalette('teal')
    // $mdIconProvider.icon('md-toggle-arrow', 'img/icons/toggle-arrow.svg', 48);
    $mdIconProvider
        .iconSet('logout', 'public/images/logout.svg', 24)
        .fontSet('md', 'material-icons')
        .defaultIconSet('public/images/logout.svg', 24);
    // $locationProvider.html5Mode({
    //     enabled: true,
    //     requireBase: false
    // });
    $locationProvider.hashPrefix(''); 

    $routeProvider
    .when("/", {
        controller: "MainController",
        templateUrl: "public/views/main.html"
    })
    .when("/topSeries", {
        controller: "TopRatedController",
        templateUrl: "public/views/topRated.html",
        resolve: {
            userShows : function($http, $rootScope) {
                if($rootScope.loggedIn){
                    return $http.get("/myShows/" + $rootScope.user).then(function(shows) {
                        return shows.data;
                    });
                }
            }
        }
    })
    .when("/login", {
        controller: "LoginController",
        templateUrl: "public/views/login.html"
    })
    .when("/signup", {
        controller: "RegisterController",
        templateUrl: "public/views/signup.html"
    })
    .when("/activate/:token", {
        controller: "ActivateController",
        templateUrl: "public/views/activate.html"
    })
    .when("/show/:id", {
        controller: "ShowController",
        templateUrl: "public/views/show.html",
        resolve: {
            episodes : function($http, $rootScope, $route) {
                if($rootScope.loggedIn) {
                    return $http.get("/userEpisodes/" + $rootScope.user + "/" + $route.current.params.id).then(function(resp){
                        return resp.data;
                    });
                }
            },
            rating: function($http, $rootScope, $route){
                if($rootScope.loggedIn) {
                    return $http.get("/ratingShow/"  + $rootScope.user + "/" + $route.current.params.id).then(function(res){
                        return res.data;
                    })
                }
            },
            seriesChanges : function($http, $route) {
                return $http.get("/tvChanges/" + $route.current.params.id).then(function(res) {
                    return res.data.changes;
                });
            }
        }
    })
    .when("/search/:query", {
        controller: "SearchController",
        templateUrl: "public/views/search.html"
    })
    .when("/myShows/", {
        controller: "MyShowsController",
        templateUrl: "public/views/myTVShows.html",
         resolve: {
            myShows : function($http, $q, $rootScope) {
                if($rootScope.loggedIn) {
                    return $http.get("/myShows/" + $rootScope.user).then(function(res) {
                        var shows = {};
                        shows = res.data;
                        return shows;
                    })
                    .then(function(shows) {
                        if(shows == "No shows for this user!"){
                            return "No shows for this user!";
                        } else {
                            var promises = [];
                            for(var i = 0; i < shows.length; i++) {
                                promises.push($http.get("/lastAndNextEpisode/" + $rootScope.user + "/" + shows[i][0]).then(function(res){
                                    return res.data;
                                }))
                            }
                            return $q.all(promises).then(function(result){
                                return result;
                            })
                        }
                    })
                }
            }
        } 
    })
    .when("/calendar", {
        controller: "CalendarController",
        templateUrl: "public/views/calendar.html", 
        resolve: {
            popularSeries :  function($http, $q, $rootScope) {
                if($rootScope.loggedIn == false) {
                    return $http.get("/topSeries").then(function(success){
                        var shows = {};
                        shows = success.data.results;
    
                        return shows;
                    })
                    .then(function(shows){
                        var contentPromises = [];
                        angular.forEach(shows, function(elem) {
                            contentPromises.push(
                                $http.get("/show/" + elem.id).then(function(success){
                                    var show = {};
                                    show = success.data;
                                    return show;
                                }).then(function(show){
                                    var promises = [];
                                    promises.push($http.get("/allEpisodes/" + show.id + "/" + show.number_of_seasons).then(function(succes){
                                        return succes.data;
                                    }))
                                    return $q.all(promises).then(function(res) {
                                        return res;
                                    });
                                    
                                })
                            );
                        });
                        return $q.all(contentPromises).then(function(res) {
                            return res;
                        });
                    });
                } else {                    
                    return $http.get("/episodesOfUser/" + $rootScope.user).then(function(res) {
                        return res.data;
                    });
                }
                
            },
            watchedEpisodes : function($http, $rootScope) {
                if($rootScope.loggedIn){
                    return $http.get("/watchedEpisodes/" + $rootScope.user).then(function(res) {
                        return res.data;
                    });
                }
            },
            avoidSpoilers : function($http, $rootScope){
                if($rootScope.loggedIn){
                    return $http.get("/userAvoid/"+$rootScope.user).then(function(res){
                        return res.data;
                    })
                }
            }
        }
    })
    .when("/recommendantions/",  {
        controller: "RecommendantionsController",
        templateUrl: "/public/views/recommendantions.html",
        resolve: {
            recommendantions: function($http, $rootScope, $q){
                if($rootScope.loggedIn){
                    return $http.get("/myShows/" + $rootScope.user).then(function(res){
                        var usersShows = {};
                        usersShows = res.data;
                        return usersShows;
                    })
                    .then(function(usersShows){
                        // var usersShows = [[1399, "Game of Thrones"],[1412, "Grey's Anatomy"],[63247,"Westworld"], [48866, "The 100"], [66732,"Stranger Things"]];
                        // var usersShows = [];
                        
                        var contentPromises = [];
                        if(usersShows.length !=0 && usersShows != "No shows for this user!") {
                            for(var i=0; i < usersShows.length; i++){
                                contentPromises.push(
                                    $http.get("/recommendantions/" + usersShows[i][0] + "/" + usersShows[i][1]).then(function(success){
                                        return success.data;
                                    })
                                );
                            }
                            return $q.all(contentPromises).then(function(res) {
                                return res;
                            });
                        } else {
                            return $http.get("/genresAPI/").then(function(res){
                                var genres = {};
                                genres = res.data.genres;

                                return res.data.genres;
                            })
                            .then(function(genres){
                                var contentPromises = [];
                                for(var i=0; i < genres.length; i++){
                                    if([10759, 18, 35, 80, 10751, 9648, 10765].indexOf(genres[i].id) > -1){
                                        contentPromises.push(
                                            $http.get("/seriesByGenre/" + genres[i].id + "/" + genres[i].name).then(function(res){
                                                return res.data;
                                            })
                                        );
                                    }
                                }
                                return $q.all(contentPromises).then(function(res) {
                                    res.push({noShows : true});
                                    return res;
                                });
                            })
                        }
                     }) 
                }
            }
        }        
    })
    .when("/settings",{
        controller: "SettingsController",
        templateUrl: "/public/views/settings.html",
        resolve: {
            userData : function($http, $rootScope){
                if($rootScope.loggedIn){
                    return $http.get("/userAvoid/"+$rootScope.user).then(function(res){
                        return res.data;
                    })
                }
            }
        }
    })
    .when("/resendPassword",{
        controller: "ForgotPassController",
        templateUrl: "/public/views/forgotPassword.html"
    })
    .when("/changePassword/:token",{
        controller: "ChangePassController",
        templateUrl: "/public/views/changePass.html",
        resolve: {
            user: function($http, $route){
                return $http.get("/userByToken/" + $route.current.params.token).then(function(res){
                    return res.data
                })
            }
        }
    })
  });
