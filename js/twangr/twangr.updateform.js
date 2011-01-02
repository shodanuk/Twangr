var Twangr = window.Twangr || {};

Twangr.UpdateForm = function(el) {
  this.el = $(el);
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