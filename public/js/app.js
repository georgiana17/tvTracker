var app = angular.module("tvTracker",['ngMaterial','ngMdIcons','ngRoute','ngMessages','materialCalendar'])
app.controller("AppController", function($scope, $http, $mdSidenav, $mdDialog, $location, $rootScope, auth, session) {
    $scope.appName = "TvTracker";
    $rootScope.loggedIn = false;
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
    
    $rootScope.getUser();

    $scope.getPopularTvSeries = function() {
        var popularData = $http.get("/topSeries").then(function(response){
            $scope.popularSeries = response.data.results;
        });
        return popularData;
    }
    $scope.getPopularTvSeries();

    $rootScope.update = function(){

        $scope.menuItems = [
            {
                link: '/',
                title: 'Home',
                icon: 'home',
                logged: true
            },
            {
                link: 'http://google.es',
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
                link: 'http://google.es',
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
app.config(function($mdThemingProvider, $mdIconProvider, $routeProvider, $locationProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('deep-purple')
      .accentPalette('pink');
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
    .when("/topSeries",{
        controller: "ShowController",
        templateUrl: "public/views/topRated.html"
    })
    .when("/login",{
        controller: "LoginController",
        templateUrl: "public/views/login.html"
    })
    .when("/signup",{
        controller: "RegisterController",
        templateUrl: "public/views/signup.html"
    })
    .when("/show/:id",{
        controller: "ShowController",
        templateUrl: "public/views/show.html"
    })
    .when("/calendar",{
        controller: "CalendarController",
        templateUrl: "public/views/calendar.html",
        resolve: {
            popularSeries :  function($http){
                var allInfoEpisodes = new Array();
                return $http.get("/topSeries").then(function(response) {
                    for(let i = 0 ; i < response.data.results.length ; i++) {
                        let show_id = response.data.results[i].id;
                        $http.get("/show/" + response.data.results[i].id).then(function(res) {
                            $http.get("/allEpisodes/" + show_id + "/" + res.data.number_of_seasons).then(function(resp) {
                                console.log(show_id);
                                allInfoEpisodes.push(resp.data);
                            });
                        });
                    }
                    return allInfoEpisodes;
                });
            }
        }
    })
  });
