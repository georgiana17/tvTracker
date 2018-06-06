"use strict"
var app = angular.module("tvTracker")
app.controller("SettingsController", function($scope, $http, $rootScope) {
    $scope.avoidSpoilers = true;
})