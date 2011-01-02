var Twangr = window.Twangr || {};

Twangr.Tweet = function(json) {
  if(typeof json !== 'object') {
    throw "InvalidTweetData";
    return false;
  } else {
    this.tweetData = json;
  }
};

Twangr.Tweet.prototype = {
  getId: function() {
    return this.tweetData.user.id;
  },
  toHTML: function(){
    if(this.tweetTemplate && this.tweetData) {
      return Mustache.to_html(this.tweetTemplate, {
        screenName: this.tweetData.user.screen_name,
        friends: this.tweetData.user.friends_count,
        following: this.tweetData.user.following,
        followers: this.tweetData.user.followers_count,
        location: this.tweetData.user.location,
        realName: this.tweetData.user.name,
        url: this.tweetData.user.url,
        userId: this.tweetData.user.id,
        avatar: this.tweetData.user.profile_image_url,
        created_at: this.tweetData.created_at,
        realName: this.tweetData.user.name,
        text: this._parseEntities(this.tweetData.text)
      });
    } else {
      throw "InvalidTweet";
      return false;
    }
  },
  _parseEntities: function(text) {
    text = text.replace(/(https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w\/_\.]*(\?\S+)?)?)?)/g , '<a href="$1">$1</a>');
    text = text.replace(/(^|\s)@(\w+)/g, '$1<a href="http://www.twitter.com/$2">@$2</a>');
    return text.replace(/(^|\s)#(\w+)/g, '$1<a href="http://search.twitter.com/search?q=%23$2">#$2</a>');
  },
  tweetTemplate: null
};