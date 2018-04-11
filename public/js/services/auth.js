var app = angular.module('tvTracker');

app.service("auth", function($http, session){

    this.isLoggedIn = function isLoggedIn(){
        return JSON.parse(session.getUser()) !== null;
    };

    this.signIn = function(credentials){
        return $http.post('/login', credentials)
          .then(function(response){
            var data = response.data;
            session.setUser(data.user);
            session.setAccessToken(data.accessToken);
        });
    };

    this.signOut = function(){
        return $http.post("/logout").then(function(response){
            session.destroy();
        });
    };
})