var app = angular.module("tvTracker",['ngMaterial','ngMdIcons','ngRoute','ngMessages', 'ui.calendar'])
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

    $scope.signout = function(){
        session.destroy();
        $location.path("/login");
        $rootScope.loggedIn = false;
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

    $scope.followSeason = function(showId) {
        $http.get("/tvShow/" + showId).then(function(response){
            return response;
        }).then(function(response) {
            if(response.data == "false") {
                $http.get("/show/" + showId).then(function(res){
                    var userName =  $rootScope.user;
                    if(userName != undefined) {
                        $http.post("/addShow/" + showId + "/" + res.data.number_of_seasons + "/" + userName).then(function(res) {
                            console.log(res);
                        });
                    }
                });                
            }
        });
    }

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
        // $scope.toggleSidenav('left');
        if(($scope.search != null ||  $scope.search !== undefined) && $scope.search != "") {
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
        $mdSidenav(menuId).toggle();
    };

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
                // logged: $rootScope.loggedIn
                logged: true
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
                link: '#/',
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
    // $mdThemingProvider.theme('default')
    //   .primaryPalette('deep-purple')
    //   .accentPalette('pink');
    $mdThemingProvider.theme('navbar')
      .primaryPalette('teal')
      .accentPalette('grey')
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
    // $locationProvider.html5Mode(true);

    $routeProvider
    .when("/", {
        controller: "MainController",
        templateUrl: "public/views/main.html"
    })
    .when("/topSeries", {
        // controller: "ShowController",
        templateUrl: "public/views/topRated.html"
    })
    .when("/login", {
        controller: "LoginController",
        templateUrl: "public/views/login.html"
    })
    .when("/signup", {
        controller: "RegisterController",
        templateUrl: "public/views/signup.html"
    })
    .when("/show/:id", {
        controller: "ShowController",
        templateUrl: "public/views/show.html"//,
        // resolve: {
        //     episodes : function($http, $rootScope, $route) {
        //         if($rootScope.loggedIn) {
        //             return $http.get("/userEpisodes/" + $rootScope.user + "/" + $route.current.params.id).then(function(resp){
        //                 return resp.data;
        //             })
        //         }
        //     }
        // }
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
                        var promises = [];
                        for(var i = 0; i < shows.length; i++) {
                            promises.push($http.get("/lastAndNextEpisode/" + $rootScope.user + "/" + shows[i]).then(function(res){
                                return res.data;
                            }))
                        }
                        return $q.all(promises).then(function(result){
                            return result;
                        })
                    })
                }
            }
            // myWatchedEpisodes : function($http, $rootScope) {
            //     if($rootScope.loggedIn) {
            //         return $http.get("/episodes/" + $rootScope.user).then(function(res) {
            //             return res.data;
            //         })
            //     }
            // }
        }
    })
    .when("/calendar", {
        controller: "CalendarController",
        templateUrl: "public/views/calendar.html", 
        resolve: {
            popularSeries :  function($http, $q) {

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
                
            }
        }
    })
  });
