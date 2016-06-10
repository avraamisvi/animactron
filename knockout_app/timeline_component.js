
function Timeline(params) {

  console.log(params)

  this.__init=function() {
    this.__create_canvas();
  }

  this.__create_canvas=function() {
    this.stage = new createjs.Stage("internal-time-line-canvas");

    var circle = new createjs.Shape();
    circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
    circle.x = 0;
    circle.y = 0;
    this.stage.addChild(circle);

    this.stage.update();
  }

  this.mouse_move = function(ev) {
    this.stage.update();
    console.log("move")
  }

  /** constructor */
  this.__init();
}

ko.components.register('time-line', {
    viewModel: Timeline,
    template: '<div id="internarl-time-line-container" ><canvas data-bind="event: { mousemove: mouse_move }" id="internal-time-line-canvas" width="300px" height="50px"></canvas></div>'
});
