var SHJS = window.SHJS || {};

SHJS.Tooltip = Class.create({
  initialize: function(opts){
    this.options = Object.extend({}, opts || {});
    this.build();
  },
  build: function(){
    this.contentWrapper = new Element('div').addClassName('tooltip-content');
    this.hiddenContentWrapper = new Element('div').addClassName('tooltip-content');
    this.tooltip = new Element('div').addClassName('tooltip').hide().update(this.contentWrapper);
    this.hiddenTooltip = new Element('div', { id: 'hiddenTooltip' }).addClassName('tooltip').hide().update(this.hiddenContentWrapper);
    this.layout = {
      left: 0,
      height: 0,
      top: 0,
      width: 0
    };
    document.body.insert(this.tooltip);
    document.body.insert(this.hiddenTooltip);
  },
  calculateSize: function(){
    var dims = this.getContentDimensions();
    this.layout.height = dims.get('height');
    this.layout.width = dims.get('width');
    this.contentWrapper.setStyle({
      height: this.layout.height+'px',
      width: this.layout.width+'px'
    });
  },
  getContentDimensions: function(){
    this.hiddenTooltip.show();
    var l = this.hiddenTooltip.getLayout();
    this.hiddenTooltip.hide();
    return l;
  },
  hide: function(){
    this.tooltip.hide();
  },
  setPosition: function(){
    var tt = this.targetElement.cumulativeOffset().top;
    if((this.targetElement.viewportOffset().top+this.layout.height) >= (document.viewport.getDimensions().height-20)){
      this.layout.top = (tt-this.layout.height);
    } else {
      this.layout.top = tt;
    }
    this.layout.left = this.targetLayout.get('left')+this.targetLayout.get('width')+20;
    this.tooltip.setStyle({
      left: this.layout.left+'px',
      top: this.layout.top+'px'
    });
  },
  setTarget: function(targetEl){
    this.targetElement = targetEl;
    this.targetLayout = this.targetElement.getLayout();
  },
  setContent: function(content){
    this.contentWrapper.update(content.innerHTML);
    this.hiddenContentWrapper.update(content.innerHTML);
  },
  show: function(){
    this.calculateSize();
    this.setPosition();
    this.tooltip.show();
  }
});

SHJS.FadingTooltip = Class.create(SHJS.Tooltip, {
  initialize: function(opts){
    this.options = Object.extend({
      contentHtml: null
    }, opts || {});
    if(this.options.contentHtml){
      this.contentTemplate = new Template(this.options.contentHtml);
      this.build();
    } else {
      return fasle;
    }
  },
  _animate: function(_style, _after, _before){
    this.fx = new S2.FX.Morph(this.tooltip, {
      after: function(){
        this.animating = false;
        _after();
      }.bind(this),
      before: function(){
        this.animating = true;
        _before();
      }.bind(this),
      engine: 'javascript',
      style: _style
    }).play();
  },
  hide: function(){
    if(this.fx && this.animating){
      this.fx.finish()
    }
    var after = function(){
      this.visible = false;
      this.tooltip.hide();
    }.bind(this);
    var before = function(){ this.tooltip.setStyle({ opacity: 1 }); }.bind(this);
    this._animate('opacity: 0', after, before);
  },
  show: function(){
    this.calculateSize();
    this.setPosition();
    if(this.fx && this.animating){
      this.fx.finish();
    }
    var after = function(){ this.visible = true; }.bind(this);
    var before = function(){
      this.tooltip.setStyle({ opacity: 0 }).show();
      this.animating = true;
    }.bind(this);
    this._animate('opacity: 1', after, before);
  }
});