var Twangr = window.Twangr || {};

Twangr.Util = {};

Twangr.Util.redirect = {
  urls: {
    fail: '/home/fail',
    home: '/home',
    my_timeline: '/tweets/my_timeline'
  },
  getUrl: function(idx) {
    var url = this.urls[idx];
    if(typeof url !== 'undefined') {
      return url;
    } else {
      throw "UrlIndexNotFound";
      return false;
    }
  },
  go: function(idx) {
    try {
      var url = this.getUrl(idx);
    } catch(e) {
      throw "RedirectFailed";
      return false;
    }
    window.location = url;
  }
};