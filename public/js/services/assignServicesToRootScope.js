var app = angular.module('tvTracker');

app.service("assignToRootScope", function($rootScope, auth, session){
    $rootScope.auth = auth;
    $rootScope.session = session;
});
