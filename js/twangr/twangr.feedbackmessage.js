var Twangr = window.Twangr || {};

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