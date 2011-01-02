var Twangr = window.Twangr || {};

Twangr.User = function(conf) {
  this.config = Object.extend({
    loginUrl: '/twitter/login2',
    oAuthUrl: '/twitter/oauth2'
  }, conf || {});
  this.isLoggedIn = false;
}

Twangr.User.prototype.getPin = function() {
  new Ajax.Request(this.config.loginUrl, {
    onSuccess: function(response) {
      var rj = response.responseJSON;
      if(rj.status === 'success'){
        this.setoAuthToken(rj.oauth_token, rj.oauth_token_secret);
        var newwindow = window.open(rj.url, 'twitter_auth', 'width=800px; height=400px');
        if (window.focus) { newwindow.focus(); }
      }
    }.bind(this)
  });
}

Twangr.User.prototype.doOAuth = function(oauth_verifier) {
  var oauth = this.getoAuthToken();

  new Ajax.Request(this.config.oAuthUrl, {
    onSuccess: function(response) {
      if(response.responseJSON.status === 'success'){
        this.isLoggedIn = true;
        this.userid = response.responseJSON.userid;
        this.username = response.responseJSON.username;
      }
    },
    parameters: {
      oauth_token: oauth.token,
      oauth_token_secret: oauth.secret,
      oauth_verifier: oauth_verifier
    }
  });
}

Twangr.User.prototype.logout = function() {
  this.isLoggedIn = false;
  this.oauth = null;
}

Twangr.User.prototype.setoAuthToken = function(oAuthToken, oAuthTokenSecret) {
  this.oauth = {
    token: oAuthToken,
    secret: oAuthTokenSecret
  };
}

Twangr.User.prototype.getoAuthToken = function() {
  return this.oauth;
}