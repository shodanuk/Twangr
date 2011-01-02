var Twangr = window.Twangr || {};

Twangr.Application = function() {
  var container,
      timeline,
      updateForm,
      user;

  function initialize() {
    container = $('container');
    user = new Twangr.User();

    if(user.isLoggedIn) {
      setup();
    } else {
      // do login...
    }
  }

  function setup() {
    updateForm = new Twangr.UpdateForm('update-form');
    try{
      setTweetTemplate();
    }catch(e){
      Twangr.Util.redirect.go('fail');
      return false;
    }
    timeline = new Twangr.Timeline('timeline');
  }

  function setTweetTemplate() {
    new Ajax.Request('/partials/tweet.html', {
      onSuccess: function(response) {
        Twangr.Tweet.prototype.tweetTemplate = response.responseText;
      },
      onFailure: function() {
        throw "InvalidTweetTemplate";
        return false;
      }
    });
  }

  document.observe('dom:loaded', initialize);
}();