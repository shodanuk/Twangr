var Twangr = window.Twangr || {};

Twangr.Timeline = function(el, options) {
  this.options = Object.extend({
    tooltipContentHtml: '<article><h1>#{name}</h1></article>'
  }, options || {});

  this.timeline = $(el);
  this.updateTimelineLink = $('update-timeline');
  this.tweets = this.timeline.down('.tweets');
  this.tooltip = new SHJS.FadingTooltip({
    contentHtml: this.options.tooltipContentHtml
  });

  this.setup();
  this.addListeners();
}

Twangr.Timeline.prototype.addListeners = function() {
  this.tweets.on('mouseover', this.onMouseOver.bind(this));
  this.tweets.on('mouseout', this.onMouseOut.bind(this));
  this.timeline.observe('click', this.onClick.bind(this));
}

Twangr.Timeline.prototype.getTweets = function(after, fail, since) {
  new Ajax.Request('/twitter/getTweets', {
    onSuccess: function(r) { after(r.responseJSON); },
    onFailure: function() { fail(); },
    parameters: {
      sinceId: since || null
    }
  });
}

Twangr.Timeline.prototype.getNewTweets = function(immediateUpdate) {
  var latestTweet = this.tweets.down('li'),
    successCallback = function(response) {
      var count = response.responseJSON.length;
      if(typeof immediateUpdate !== 'undefined' && count > 0){
        this.updateTimeline(response.responseJSON);
      }else{
        // or... what?
      }
    }.bind(this),
    failCallback = function() {
      var errorMsg = new Element('div').addClassName('errorMsg').hide(),
          h = errorMsg.getHeight();
      errorMsg.update("Looks like Twitter is throwing a wobbly. Try again in a bit.");
      this.timeline.insert({ top: errorMsg });
      errorMsg.morph('height: '+h+'px', {
        before: function(){
          errorMsg.setStyle({
            height: 0
          }).show();
        }
      });
      newTweets = false;
    }.bind(this);

  new Ajax.Request('/twitter/getTweets', {
    onSuccess: successCallback,
    onFailure: failCallback,
    parameters: {
      sinceId: latestTweet ? latestTweet.id : null
    }
  });
}

Twangr.Timeline.prototype.onClick = function(e) {
  if(e.findElement('#update-timeline')) {
    e.stop();
    this.getNewTweets(true);
  }
}

Twangr.Timeline.prototype.onMouseOver = function(e) {
  var el = e.findElement('.avatar img');
  if(el) {
    this.tooltipDelay = this.showTooltip.bind(this).delay(0.3, el.up('.user').down('.details'), el);
  }
}

Twangr.Timeline.prototype.onMouseOut = function(e) {
  var el = e.findElement('.avatar img');

  if(el && e.relatedTarget !== el) {
    if(this.tooltipDelay) {
      clearTimeout(this.tooltipDelay);
    }
    this.tooltip.hide();
  }
}

Twangr.Timeline.prototype.setup = function() {
  var successCallback = function(tweetData){
    var template = "{{#tweets}}<li id='{{id}}'>{{{html}}}</li>{{/tweets}}";
    var view = { tweets: $A() };

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
    this.tweets.insert({ top: Mustache.to_html(template, view) });
  }.bind(this),
  failCallback = function() {
    var errorMsg = new Element('div').addClassName('errorMsg').hide(),
        h = errorMsg.getHeight();
    errorMsg.update("Looks like Twitter is throwing a wobbly. Try again in a bit.");
    this.timeline.insert({ top: errorMsg });
    errorMsg.morph('height: '+h+'px', {
      before: function(){
        errorMsg.setStyle({
          height: 0
        }).show();
      }
    });
  }.bind(this);

  this.getTweets(successCallback, failCallback);
}

Twangr.Timeline.prototype.showTooltip = function(content, el) {
  console.log(this.tooltip);

  this.tooltip.setContent(content);
  this.tooltip.setTarget(el);
  this.tooltip.show();
}

Twangr.Timeline.prototype.updateTimeline = function(newTweets) {
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

    this.tweets.insert({top: li});
    li.morph('opacity: 1');
  }
}