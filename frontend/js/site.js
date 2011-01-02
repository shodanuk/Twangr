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

Twangr.FeedbackMsg = function(container, options) {
  this.container = $(container);
  this.options = Object.extend({
    insertPosition: 'top'
  }, options || {});
  this.messageTypes = ['good','warning','error','info'];
  this._build();
};

Twangr.FeedbackMsg.prototype = {
  _build: function() {
    this.feedbackMsg = new Element('div').addClassName('feedback').setStyle({ opacity: 0 }).hide();
    var opts = {};
    opts[this.options.insertPosition] = this.feedbackMsg;
    this.container.insert(opts);
  },
  resetFeedbackMsg: function() {
    $w(this.feedbackMsg.className).each(function(c){
      if(this.messageTypes.include(c)){
       this.feedbackMsg.removeClassName(c);
      }
    }.bind(this));
    this.feedbackMsg.morph('opacity: 0', { engine: 'javascript' });
    this.feedbackMsg.innerHTML = '';
  },
  showGood: function(content) {
    this._showFeedbackMsg('good', content);
  },
  showError: function(content) {
    this._showFeedbackMsg('error', content);
  },
  showInfo: function(content) {
    this._showFeedbackMsg('info', content);
  },
  showWarning: function(content) {
    this._showFeedbackMsg('warning', content);
  },
  _showFeedbackMsg: function(type, content) {
    this.resetFeedbackMsg();
    this.feedbackMsg.innerHTML = content;
    this.feedbackMsg.addClassName(type);
    this.feedbackMsg.morph('opacity: 1', {
      before: function(){
        this.feedbackMsg.setStyle({
          opacity: 0
        }).show();
      }.bind(this),
      engine: 'javascript'
    });
  }
};

Twangr.UpdateForm = function() {
  this.el = $('update-form');
  this.statusField = $('status-update');
  this.submitButton = new S2.UI.Button('submit');

  this._build();
  this._addListeners();
};

Twangr.UpdateForm.prototype = {
  _addListeners: function(){
    this.onKeyUpListener = this.onKeyUp.bind(this);
    this.onSubmitListener = this.onKeyUp.bind(this);
    this.statusField.observe('keyup', this.onKeyUpListener);
    this.el.observe('submit', this.onSubmitListener);
  },
  _build: function() {
    this.feedbackMsg = new Twangr.FeedbackMsg('update');
    this.toggleSubmitButton();
  },
  onKeyUp: function(e) {
    this.toggleSubmitButton();
  },
  onSubmit: function(e) {
    e.stop();
    var val;
    if(val = $F(this.statusField)) {
      if(this.el.hasClassName('invalid')) {
        this.resetUpdateForm();
      }

      new Ajax.Request(this.el.action, {
        onSuccess: function(response) {
          this.resetUpdateForm();
          this.feedbackMsg.showGood(response.responseJSON.resultText);
        },
        parameters: {
          status: val
        }
      });
    } else {
      if(!this.el.hasClassName('invalid')) {
        this.feedbackMsg.showWarning('Nothing to say? Unlike you.');
        this.el.addClassName('invalid');
      }
      this.statusField.activate();
    }
  },
  resetUpdateForm: function () {
    this.el.select('div.error').each(function(el) {
      el.morph('opacity: 0', {
        after: function(){
          el.remove();
        },
        engine: 'javascript'
      });
    });
    this.el.removeClassName('invalid');
    this.statusField.setValue('');
  },
  toggleSubmitButton: function() {
    if($F(this.statusField)){
      this.submitButton.setEnabled(true);
    } else {
      this.submitButton.setEnabled(false);
    }
  }
};

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

Twangr.Application = function() {
  var container,
      newTweets,
      options,
      feedbackMsg,
      tooltip,
      tooltipDelay,
      timeline,
      tweets,
      updateForm,
      updateTimelineLink,
      userDetailsHTML,
      userDetailsTemplate;

  function initialize(opts) {
    options = Object.extend({
      debug: false,
      tooltipContentHtml: '<article><h1>#{name}</h1></article>'
    }, opts || {});

    container = $('container');

    if(document.body.hasClassName('logged-in')) {
      timeline = $('timeline');
      updateTimelineLink = $('update-timeline');
      tweets = timeline.down('.tweets');

      // And off we go...
      build();
    }
  }

  function addListeners() {
    if(options.debug) console.info('addListeners');

    tweets.on('mouseover', onMouseOver);
    tweets.on('mouseout', onMouseOut);
    timeline.observe('click', onClick);
  }

  function build() {
    if(options.debug) console.info('build');

    updateForm = new Twangr.UpdateForm();
    tooltip = new SHJS.FadingTooltip({
      contentHtml: options.tooltipContentHtml
    });

    try{
      setTweetTemplate();
    }catch(e){
      Twangr.Util.redirect.go('fail');
      return false;
    }

    buildTimeline();
    //getNewTweets(true);
    addListeners();
  }

  function buildTimeline() {
    var successCallback = function(tweetData){
      var template = "{{#tweets}}<li id='{{id}}'>{{{html}}}</li>{{/tweets}}";
      var view = {tweets: $A()};

      for(var i = (tweetData.length-1) ; i >= 0 ; i--) {
        try {
          var tweet = new Twangr.Tweet(tweetData[i]);
        } catch(ex) {
          console.log(ex);
        }

        view.tweets.push({
          id: tweet.getId(),
          html: tweet.toHTML()
        });
      }
      tweets.insert({ top: Mustache.to_html(template, view) });
    },
    failCallback = function() {
      var errorMsg = new Element('div').addClassName('errorMsg').hide(),
          h = errorMsg.getHeight();
      errorMsg.update("Looks like Twitter is throwing a wobbly. Try again in a bit.");
      timeline.insert({ top: errorMsg });
      errorMsg.morph('height: '+h+'px', {
        before: function(){
          errorMsg.setStyle({
            height: 0
          }).show();
        }
      });
    };

    getTweets(successCallback, failCallback);
  }

  function getTweets(after, fail, since) {
    new Ajax.Request('/twitter/getTweets', {
      onSuccess: function(r) { after(r.responseJSON); },
      onFailure: function() { fail(); },
      parameters: {
        sinceId: since || null
      }
    });
  }

  function getNewTweets(immediateUpdate) {
    if(options.debug) console.info('getNewTweets');

    var latestTweet = tweets.down('li'),
        successCallback = function(response) {
          var count = response.responseJSON.length;
          if(typeof immediateUpdate !== 'undefined' && count > 0){
            updateTimeline(response.responseJSON);
          }else{
            // or... what?
          }
        },
        failCallback = function() {
          var errorMsg = new Element('div').addClassName('errorMsg').hide(),
              h = errorMsg.getHeight();
          errorMsg.update("Looks like Twitter is throwing a wobbly. Try again in a bit.");
          timeline.insert({ top: errorMsg });
          errorMsg.morph('height: '+h+'px', {
            before: function(){
              errorMsg.setStyle({
                height: 0
              }).show();
            }
          });
          newTweets = false;
        };

    new Ajax.Request('/twitter/getTweets', {
      onSuccess: successCallback,
      onFailure: failCallback,
      parameters: {
        sinceId: latestTweet ? latestTweet.id : null
      }
    });
  }

  function onClick(e) {
    if(options.debug) console.info('onClick');

    if(e.findElement('#update-timeline')){
      e.stop();
      getNewTweets(true);
    }
  }

  function onMouseOver(e) {
    if(options.debug) console.info('onMouseOver');

    var el;
    if(el = e.findElement('.avatar img')){
      tooltipDelay = showTooltip.delay(0.3, el.up('.user').down('.details'), el);
    }
  }

  function onMouseOut(e) {
    if(options.debug) console.info('onMouseOut');

    var el = e.findElement('.avatar img');
    if(el && e.relatedTarget !== el){
      if(tooltipDelay){
        clearTimeout(tooltipDelay);
      }
      tooltip.hide();
    }
  }

  function setTweetTemplate() {
    if(options.debug) console.info('getTweetTemplate');

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

  function showTooltip(content, el) {
    if(options.debug) console.info('showTooltip');

    tooltip.setContent(content);
    tooltip.setTarget(el);
    tooltip.show();
  }

  function updateTimeline(newTweets) {
    if(options.debug) console.info('updateTimeline');

    for(var i = (newTweets.length-1) ; i >= 0 ; i--) {
      try{
        var tweet = new Twangr.Tweet(newTweets[i]);
      }catch(ex){
        console.log(ex);
      }

      var li = new Element('li', { id: tweet.getId() }).
                          update(tweet.toHTML()).
                          setStyle({
                            opacity: 0
                          });

      tweets.insert({top: li});
      li.morph('opacity: 1');
    }
  }

  document.observe('dom:loaded', initialize);
}();