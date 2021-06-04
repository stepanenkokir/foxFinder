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
        console.log("My cvs = "+this.cv);        
        this.cv.height = global.screenHeight;
        this.cv.addEventListener('mousemove', this.gameInput, false);
        this.cv.addEventListener('mousedown', this.gameClick, false);
        this.cv.addEventListener('wheel', this.gameWheel, false);                                 
        //this.cv.addEventListener('blur', this.myBlur, false);
        this.cv.parent = self;
        global.canvas = this;  

        console.log("My cvs = "+this);          
    }

    gameInput(mouse) {  
        this.parent.target.x = global.target.x;        
        this.parent.target.y =global.target.y;        
        this.parent.target.x1 = mouse.clientX - this.width / 2;
        this.parent.target.y1 = mouse.clientY - this.height / 2;       
        global.target = this.parent.target;  
        global.tecAngle = Math.atan2(this.parent.target.y1, this.parent.target.x1);            
        if(global.gameStart) global.canvas.socket.emit('0', global.target);       
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
                //     console.log ("Right button is pressed");
                     event.preventDefault();
                break;
            }
        }
    }

    gameWheel(e)
    {
        console.log("WHEELMOUSE!!!");
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

    

    

    horizontal(key) {
        return key == global.KEY_LEFT || key == global.KEY_RIGHT;
    }

    vertical(key) {
        return key == global.KEY_DOWN || key == global.KEY_UP;
    }

    directional(key) {
        return this.horizontal(key) || this.vertical(key);
    }

    newDirection(direction, list, isAddition) {
        var result = false;
        var found = false;
        for (var i = 0, len = list.length; i < len; i++) {
            if (list[i] == direction) {
                found = true;
                if (!isAddition) {
                    result = true;
                    // Removes the direction.
                    list.splice(i, 1);
                }
                break;
            }
        }
        // Adds the direction.
        if (isAddition && found === false) {
            result = true;
            list.push(direction);
        }
        return result;
    }


    directionDown(event) {        

        if (!global.gameStart)       
            return;

        var key = event.which || event.keyCode;   
        var self = global.canvas; // have to do this so we are not using the cv object       
        if (key==global.KEY_SHIFT)  
            self.target.shift=true;    
            
        
        
        if (self.directional(key)) {
            self.directionLock = false;
            if (self.newDirection(key, self.directions, true)) {
                self.updateTarget(self.directions);
                self.socket.emit('0', self.target);                            
              //  console.log("DOWN "+ self.target.x+":"+self.target.y+ " | " + self.target.x1+":"+self.target.y1);
            }            
        }       
    }

    directionUp(event) {      
        if (!global.gameStart)       
            return;
        var key = event.which || event.keyCode;
      //  console.log("Press Up!! "+key);  
        var self = global.canvas; // have to do this so we are not using the cv object

        if (key==global.KEY_SHIFT)                    
            self.target.shift=false;
        
        
        if (self.directional(key)) { // this == the actual class
            if (self.newDirection(key, self.directions, false)) {
                self.updateTarget(self.directions);
                if (self.directions.length === 0) self.directionLock = false;
                self.socket.emit('0', self.target);
             //   console.log("UP "+ self.target.x+":"+self.target.y+ " | " + self.target.x1+":"+self.target.y1);
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
                //if (list[i] == global.KEY_LEFT) directionHorizontal -= Number.MAX_VALUE;                
                //else if (list[i] == global.KEY_RIGHT) directionHorizontal += Number.MAX_VALUE;

                if (list[i] == global.KEY_LEFT) directionHorizontal -= 1;
                else if (list[i] == global.KEY_RIGHT) directionHorizontal += 1;
            }
            if (directionVertical === 0) {
                //if (list[i] == global.KEY_UP) directionVertical -= Number.MAX_VALUE;
                //else if (list[i] == global.KEY_DOWN) directionVertical += Number.MAX_VALUE;
                if (list[i] == global.KEY_UP) directionVertical -= 1;
                else if (list[i] == global.KEY_DOWN) directionVertical += 1;
            }
        }
        this.target.x += directionHorizontal;
        this.target.y += directionVertical;        
        
        global.target = this.target;
    }

    

     myBlur(event)
    {

        console.log("Blur canvas :o(");
        global.target.x = 0;
        global.target.y = 0; 
       this.target =  global.target;
       var self = this.parent;
      //  this.directions.splice(0);  
       self.directions.splice(0);  
    }

}
module.exports = Canvas;


