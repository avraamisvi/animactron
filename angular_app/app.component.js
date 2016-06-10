const {dialog} = require('electron').remote;
//console.log(dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']}));

function create_project() {
  return {
    name: "project1",
    images: {
      // {"id":1, "path": "braco.png"},
    },
    animations: {
      "animation1": {
        name: "animation1",
        frames: [{
          id: 0,
          images: {
            //{"type":"normal", "id":1, "x": 0, "y": 0, "yrot": 0, "xrot": 0, "xscale": 0, "yxscale": 0},
            //{"type":"normal", "id":2, "x": 0, "y": 0, "yrot": 0, "xrot": 0, "xscale": 0, "yxscale": 0},
            //{"type":"mesh", "reservado":"nem sera lido pelo processador serve apenas para indicar isso pro futuro"}
          }
        }]
      }
    }
  }
}

(function(app) {

  //app.current_animation = {frames:[{id:0}, {id:1}]};

  app.AppComponent =
    ng.core.Component({
      selector: 'my-app',
      template: nunjucks.render('main.tmpl.html')
    })
    .Class({
      constructor: function() {
        //this.canvas = new fabric.Canvas('editor-canvas', {height:512, width:776}); TODO
        window.project = create_project()

        // this.selected_layer = "layer1";
        this.selected_animation = "animation1";
        this.selected_frame = 0;
        this.frame_count = 0;
        this.images_count = 0;

        this.current_animation = this.get_current_animation();//.frames
        this.items = [1,2,3,4]
      },

      generate_img_id: function() {
        return "canvas_images_" + (this.images_count++);
      },

      generate_frame_id: function() {
        return "canvas_frames_" + (this.frame_count++);
      },

      get_current_animation: function() {
        return project.animations[this.selected_animation];
      },

      get_current_frame: function() {
        return project.animations[this.selected_animation].frames[this.selected_frame];
      },

      update_image_object_stats: function(id, options) {

        if(options) {
          if(options.angle) {
            this.get_current_frame().images[id].angle = options.angle;
          }

          if(options.x) {
            this.get_current_frame().images[id].x = options.x;
          }

          if(options.y) {
            this.get_current_frame().images[id].y = options.y;
          }

        }
      },

      add_image_object: function(img) {

        //console.log(img)
        img._element.id = this.generate_img_id();
        project.images[img._element.id] = img;

        img_object = {
            type:"normal",
            id: img._element.id,
            x: 0,
            y: 0,
            z: 0,
            angle:0,
            xscale: 1,
            yscale: 1
          },

          this.get_current_frame().images[img_object.id]=img_object;
          console.log(project);

          this.canvas.add(img);//Adding to canvas
      },

      /**
        PUBLICAS
      */

      add_image: function() {

        if(!this.canvas) {
            this.canvas = new fabric.Canvas('editor-canvas', {height:512, width:776});

            this.canvas.on('object:rotating', function(self) {
              return function(options) {
                self.update_image_object_stats(options.target._element.id, {angle: options.target.angle});
              }
            }(this));

            this.canvas.on('object:moving', function(self) {
              return function(options) {
                self.update_image_object_stats(options.target._element.id, {x: options.e.x, y: options.e.y});
              }
            }(this));

        }

        paths = dialog.showOpenDialog({properties: ['openFile', 'multiSelections'],
        filters: [
          {name: 'Images', extensions: ['jpg', 'png']}
        ]
        });

        if(paths) {
          paths.forEach(function(canvasController){
            return function(path){
              // console.log(path);
              fabric.Image.fromURL(path, function(oImg) {
                canvasController.add_image_object(oImg);
              });
            };
          }(this));
        }
      },

      add_frame: function() {
      },

      remove_frame: function() {
      },
    });
})(window.app || (window.app = {}));
