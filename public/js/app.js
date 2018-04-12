var app = angular.module("tvTracker",['ngMaterial','ngMdIcons','ngRoute','ngMessages'])
app.controller("AppController", function($scope, $http, $mdSidenav, $mdDialog, $location, $rootScope, auth, session){
    $scope.appName = "TvTracker";
    $rootScope.loggedIn = false;
    $rootScope.getUser = function() {
        if(auth.isLoggedIn()){
            $rootScope.user = JSON.parse(session.getUser());
            console.log($rootScope.user + "ssss");
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
                link: 'http://google.es',
                title: 'Calendar',
                icon: 'date_range',
                logged: $rootScope.loggedIn
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

    $scope.getPopularTvSeries = function() {
        var popularData = $http.get("/topSeries").then(function(response){
            $scope.popularSeries = response.data.results;
        });
        return popularData;
    }
    $scope.getPopularTvSeries();

    // var tvShows = [1412, 1418, 60735, 1622];
    // $http.get("/randomImage/60735").then(function(response){
    //     console.log("https://image.tmdb.org/t/p/original/"+response.data.backdrop_path);
    //     $scope.backgroundImage = "https://image.tmdb.org/t/p/original/" + response.data.backdrop_path;
    // });

   })
app.config(function($mdThemingProvider, $mdIconProvider, $routeProvider, $locationProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('deep-purple')
      .accentPalette('orange');

    // $mdIconProvider.icon('md-toggle-arrow', 'img/icons/toggle-arrow.svg', 48);
    $mdIconProvider
        .iconSet('logout', 'images/logout.svg', 24)
        .fontSet('md', 'material-icons')
        .defaultIconSet('images/logout.svg', 24);
    // $locationProvider.html5Mode({
    //     enabled: true,
    //     requireBase: false
    // });
    $locationProvider.hashPrefix(''); 
    // $locationProvider.html5Mode(true);

    $routeProvider
    .when("/", {
        templateUrl: "views/main.html"
    })
    .when("/topSeries",{
        templateUrl: "views/topRated.html"
    })
    .when("/login",{
        controller: "LoginController",
        templateUrl: "views/login.html"
    })
    .when("/signup",{
        controller: "RegisterController",
        templateUrl: "views/signup.html"
    })
    .when("/show/:id",{
        controller: "ShowController",
        templateUrl: "views/show.html"
    })
  });
