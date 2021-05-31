var global = require('./global');
var upK = false;
var dwK = false;
var lfK = false;
var rgK = false;
class Canvas {
    constructor(params) {
        this.directionLock = false;
        global.target = { x : 0, y: 0, x1:0, y1:0 };
        this.target = global.target;       
        this.socket = global.socket;
        this.directions = [];
        var self = this;

        this.cv = document.getElementById('cvs');
        this.cv.width = global.screenWidth;
        this.cv.height = global.screenHeight;
        this.cv.addEventListener('mousemove', this.gameInput, false);
        this.cv.addEventListener('mousedown', this.gameClick, false);
        this.cv.addEventListener('wheel', this.gameWheel, false);     
        this.cv.addEventListener('keyup',function(event) {            
            self.directionUp(event);
        }, false);
        this.cv.addEventListener('keydown', this.directionDown, false);       
        this.cv.addEventListener('blur', this.myBlur, false);
        this.cv.parent = self;
        global.canvas = this;    
    }

    gameInput(mouse) {  
        this.parent.target.x = global.target.x;        
        this.parent.target.y =global.target.y;        
        this.parent.target.x1 = mouse.clientX - this.width / 2;
        this.parent.target.y1 = mouse.clientY - this.height / 2;       
        global.target = this.parent.target;  
        global.tecAngle = Math.atan2(this.parent.target.y1, this.parent.target.x1);
    }

    gameClick(event){
        if ('which' in event) {
            switch (event.which) {
                case 1:
                //console.log("Left button is pressed");
                    global.leftButtonPress = true;
                break;
                case 2:
                    // console.log ("Middle button is pressed");
                break;
                case 3:
                    // console.log ("Right button is pressed");
                break;
            }
        }
    }

    gameWheel(e)
    {
        /*
        e = e || window.event;
        var delta = e.deltaY || e.detail || e.wheelDelta;
        
        if ((delta<0)&&(global.meterPerPixel>1))
        {
            global.radius -= 10;                  
            global.meterPerPixel/=2;          
        }
        
        if ((delta>0)&&(global.meterPerPixel<100))
        {
            global.meterPerPixel*=2; 
            global.radius += 10;             
        }
        
        
        global.target = this.parent.target;  
        
        global.resize = true;
        
        console.log("Scale = "+global.meterPerPixel);
        */
    }

    directionDown(event) {
        var key = event.which || event.keyCode;
               
        var self = this.parent; // have to do this so we are not using the cv object
        if (self.directional(key)) {
            self.directionLock = false;
            if (self.newDirection(key, self.directions, true)) {
                self.updateTarget(self.directions);
                self.socket.emit('0', self.target);
            }
        }
    }

    // Function called when a key is lifted, will change direction if arrow key.
    directionUp(event) {        
        var key = event.which || event.keyCode;
        
        if (this.directional(key)) { // this == the actual class
            if (this.newDirection(key, this.directions, false)) {
                this.updateTarget(this.directions);
                if (this.directions.length === 0) this.directionLock = false;
                this.socket.emit('0', this.target);
            }
        }
    }

     updateTarget(list) {    
        this.target.x = 0;
        this.target.y = 0;
        this.target.x1 = global.target.x1;
        this.target.y1 = global.target.y1;
        //this.parent.target.y1 = global.target.y1;    
        var directionHorizontal = 0;
        var directionVertical = 0;
        for (var i = 0, len = list.length; i < len; i++) {
            if (directionHorizontal === 0) {
                if (list[i] == global.KEY_LEFT) directionHorizontal -= Number.MAX_VALUE;
                else if (list[i] == global.KEY_RIGHT) directionHorizontal += Number.MAX_VALUE;
            }
            if (directionVertical === 0) {
                if (list[i] == global.KEY_UP) directionVertical -= Number.MAX_VALUE;
                else if (list[i] == global.KEY_DOWN) directionVertical += Number.MAX_VALUE;
            }
        }
        this.target.x += directionHorizontal;
        this.target.y += directionVertical;
        
        
        global.target = this.target;
    }

    directional(key) {
        return this.horizontal(key) || this.vertical(key);
    }

    horizontal(key) {
        return key == global.KEY_LEFT || key == global.KEY_RIGHT;
    }

    vertical(key) {
        return key == global.KEY_DOWN || key == global.KEY_UP;
    }

     myBlur(event)
    {
        global.target.x = 0;
        global.target.y = 0; 
       this.target =  global.target;
       var self = this.parent;
      //  this.directions.splice(0);  
       self.directions.splice(0);  
    }

}