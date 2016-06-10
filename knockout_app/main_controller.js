// function hello() {
//   console.log("oi:" + this)
// }
//
//
// // This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
// function AppViewModel() {
//     this.firstName = ko.observable("Bert");
//     this.lastName = ko.observable("Bertington");
//     this.frames = [{id:1, teste:hello},{id:2, teste:hello},{id:3, teste:hello}]
//
//     this.fullName = ko.computed(function() {
//         return this.firstName() + " " + this.lastName();
//     }, this);
//
//     this.capitalizeLastName = function() {
//         var currentVal = this.lastName();        // Read the current value
//         this.lastName(currentVal.toUpperCase()); // Write back a modified value
//     };
// }

const {dialog} = require('electron').remote;
//console.log(dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']}));

function create_project() {
  return {
    name: "project1",
    images: {
      // {"id":1, "path": "braco.png", z: 0},
    },
    animations: {
      "animation1": {
        name: "animation1",
        frames: ko.observableArray([{
          id: 0,
          selected: ko.observable(true),
          images: {
            //{"type":"normal", "id":1, "x": 0, "y": 0, "yrot": 0, "xrot": 0, "xscale": 0, "yxscale": 0},
            //{"type":"normal", "id":2, "x": 0, "y": 0, "yrot": 0, "xrot": 0, "xscale": 0, "yxscale": 0},
            //{"type":"mesh", "reservado":"nem sera lido pelo processador serve apenas para indicar isso pro futuro"}
          }
        }])
      }
    }
  }
}

function clone_object(obj) {
  return (JSON.parse(JSON.stringify(obj)));
}

function MainViewModel() {

  //app.current_animation = {frames:[{id:0}, {id:1}]};
      var self = this;

      this.generate_img_id = function() {
        return "canvas_images_" + (this.images_count++);
      },

      this.get_current_animation = function() {
        return project.animations[this.selected_animation];
      },

      this.get_current_frame = function() {
        return project.animations[this.selected_animation].frames()[this.selected_frame];
      },

      /**
        Atualiza o estado da imagem de acordo com o evento
      */
      this.update_image_object_stats = function(id, options) {

        if(options) {

          if(!this.get_current_frame().images[id]) {
            this.__add_image_object_current_frame(this.__create_image_object(id));
          }

          // if(options.angle) {
            this.get_current_frame().images[id].angle = options.angle;
          // }

          // if(options.x) {
            this.get_current_frame().images[id].x = options.left;
          // }

          // if(options.y) {
            this.get_current_frame().images[id].y = options.top;
          // }

        }
      }

      /** Obtem a imagem q esta no canvas*/
      this.__get_image = function(id) {
        return self.project.images[id];
      }

      /**
        Configura as imagens ao estado dos images objects do frame atual
      */
      this.__set_images_to_frame_state = function() {
        //TODO
      }

      /**
        Cria um objeto de configuracao para uma imagem, pelo id
      */
      this.__create_image_object =function(id) {
        return {
            type:"normal",
            id: id,
            x: 0,
            y: 0,
            angle:0,
            xscale: 1,
            yscale: 1,
            visible: true
          };
      }

      /**
        Adiciona a configuracao da imagem ao frame atual
      */
      this.__add_image_object_current_frame = function(img_object) {
        this.get_current_frame().images[img_object.id]=img_object;
      }

      /**
        Adiciona uma imagem ao projeto
      */
      this.add_image_object = function(img) {

        //console.log(img)
          img._element.id = this.generate_img_id();
          project.images[img._element.id] = img;

          img_object = this.__create_image_object(img._element.id);
          this.__add_image_object_current_frame(img_object);

          this.canvas.add(img);//Adding to canvas
      }

      /**
        Cria o canvas
      */
      this.__create_canvas = function() {
        if(!this.canvas) {
            this.canvas = new fabric.Canvas('editor-canvas', {height:512, width:776});

            this.canvas.on('object:rotating', function(self) {
              return function(options) {
                _id = options.target._element.id;
                options = self.__get_image(_id);
                self.update_image_object_stats(_id, options);
              }
            }(this));

            this.canvas.on('object:moving', function(self) {
              return function(options) {
                _id = options.target._element.id;
                options = self.__get_image(_id);
                self.update_image_object_stats(_id, options);
              }
            }(this));

        }
      }

      /**
        Copia as imagens objeto para o novo frame TODO ver se eh realmente necessario a ideia eh manter o estado anterior
        Depreciado
      */
      this.copy_current_images_objects = function() {
          return clone_object(this.get_current_frame().images);
      }

      this.__change_frame = function(next) {
        self.get_current_frame().selected(false);
        self.selected_frame = next;
        self.get_current_frame().selected(true);

        this.__apply_status_imagem_frame();//TODO ver se deve ficar aqui
      }

      /** Aplica as configuracoes do frame nas imagens */
      this.__apply_status_imagem_frame = function(next) {

        self.canvas.forEachObject(function(obj){
          img_obj = self.get_current_frame().images[obj._element.id];
          if(img_obj)
            obj.set({ left: img_obj.x, top: img_obj.y, angle: img_obj.angle }).setCoords();
        });

        self.canvas.renderAll();
      }

      /** inicia a animacao */
      this.__create_animation_update_object = function() {
        setTimeout(function() {

          self.step_frame();

          if(self.playing) {
            self.__create_animation_update_object();
          }

        }, 50);//fabric.util.getRandomInt(1, 7) *
      }

      /**
        ################ PUBLICAS #########################
      */

      this.add_image = function() {

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
      }

      /**adiciona um frame*/
      this.add_frame = function() {
        this.get_current_animation().frames.push({
          id: this.get_current_animation().frames().length,
          selected: ko.observable(false),
          images: {}//this.copy_current_images_objects()
        })
      }

      /**remove um frame*/
      this.remove_frame = function() {
      }

      /**Seleciona um novo frame*/
      this.select_frame = function(obj) {
        /** Aqui preciso usar o self */

        if(self.get_current_frame().id != obj.id) {
          self.__change_frame(obj.id);
        }
      }

      this.up_image = function() {
      }

      this.down_image = function() {
      }

      this.play = function() {
        self.playing = true;
        this.__create_animation_update_object()
      }

      this.stop = function() {
        self.playing = false;
      }

      this.step_frame = function() {
        var next = self.get_current_frame().id+1

        if(next >= self.get_current_animation().frames().length) {
          next = 0;
        }

        this.__change_frame(next);
      }

      this.register_timeline = function(timeline) {
        this.timeline = timeline;
      }

      /** construtor*/
      this.__init__();
}

/**Pseudo construtor para separar do construtor acima TODO ver formas melhores*/
MainViewModel.prototype.__init__ = function() {
  // this.template = nunjucks.render('main.tmpl.html');
  window.project = create_project()

  this.project = project;

  this.playing = false;

  // this.selected_layer = "layer1";
  this.selected_animation = "animation1";
  this.selected_frame = 0;
  // this.frame_count = 0;//TODO rever a necessidade disso
  this.images_count = 0;

  this.current_animation = this.get_current_animation();//.frames
  this.__create_canvas();
}

// Activates knockout.js
ko.applyBindings(new MainViewModel());
