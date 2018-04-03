var app = angular.module('tvTracker');

app.service("localStorage", function($window){
    if($window.localStorage){
        return $window.localStorage;
    }
});