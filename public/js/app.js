var app = angular.module("tvTracker",['ngMaterial','ngMdIcons','ngRoute','ngMessages'])
app.controller("AppController", function($scope,$http, $mdSidenav, $mdDialog){
    $scope.firstName = "TvTracker";
    $scope.menuItems = [
        {
            link: '/',
            title: 'Home',
            icon: 'home'
        },
        {
            link: 'http://google.es',
            title: 'My TV Shows',
            icon: 'favorite'
        },
        {
            link: 'http://google.es',
            title: 'Calendar',
            icon: 'date_range'
        },
        {
            link: '#/login',
            title: 'Login',
            icon: 'login'
        },
        {
            link: '#/signup',
            title: 'Sign up',
            icon: 'register'
        }
        
    ]
    $scope.userItems = [
        {
            link: '#/topSeries',
            title: 'Top Series',
            icon: 'star'
        },
        {
            link: 'http://google.es',
            title: 'Recommendations',
            icon: 'thumb_up'
        }
    ]

    $scope.getPopularTvSeries = function() {
        var popularData = $http.get("/topSeries").then(function(response){
            $scope.popularSeries = response.data.results;
        });
        return popularData;
    }
    $scope.getPopularTvSeries();
   })
app.config(function($mdThemingProvider, $mdIconProvider, $routeProvider, $locationProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('deep-purple')
      .accentPalette('orange');

    $mdIconProvider.icon('md-toggle-arrow', 'img/icons/toggle-arrow.svg', 48);

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
    
  })
