
var global = require('./global');

let img = new Image();
// Назначение путь до картинки
img.src = "/image/man_1.png";

let walker = new Image();
// Назначение путь до картинки
walker.src = "/image/walk.png";

var direct=0;

function drawgrid() {

   // console.log("show grid! ="+ global.xoffset+" : "+ global.screenWidth+" || "+global.yoffset+ " | "+ global.screenHeight+"  |  "+global.player.x+":"+global.player.y);
    global.graphCtx.lineWidth = 1;
    global.graphCtx.strokeStyle = global.lineColor;
    global.graphCtx.globalAlpha = 1;
    global.graphCtx.beginPath();

    for (var x = global.xoffset - global.player.x; x < global.screenWidth; x += global.screenHeight / 10) {     
        global.graphCtx.moveTo(x, 0);
        global.graphCtx.lineTo(x, global.screenHeight);
    }

    for (var y = global.yoffset - global.player.y ; y < global.screenHeight; y += global.screenHeight / 10) {
        global.graphCtx.moveTo(0, y);
        global.graphCtx.lineTo(global.screenWidth, y);
    }
    global.graphCtx.stroke();
       
    global.graphCtx.lineWidth = 5;
    // Left-vertical.
    if (global.player.x <= global.screenWidth/2) {
        global.graphCtx.beginPath();
        global.graphCtx.moveTo(global.screenWidth/2 - global.player.x, 0 ? global.player.y > global.screenHeight/2 : global.screenHeight/2 - global.player.y);
        global.graphCtx.lineTo(global.screenWidth/2 - global.player.x, global.gameHeight + global.screenHeight/2 - global.player.y);
        global.graphCtx.strokeStyle = global.borderColor;
        global.graphCtx.stroke();
    }

    // Top-horizontal.
    if (global.player.y <= global.screenHeight/2) {
        global.graphCtx.beginPath();
        global.graphCtx.moveTo(0 ? global.player.x > global.screenWidth/2 : global.screenWidth/2 - global.player.x, global.screenHeight/2 - global.player.y);
        global.graphCtx.lineTo(global.gameWidth + global.screenWidth/2 - global.player.x, global.screenHeight/2 - global.player.y);
        global.graphCtx.strokeStyle = global.borderColor;
        global.graphCtx.stroke();
    }

    // Right-vertical.
    if (global.gameWidth - global.player.x <= global.screenWidth/2) {
        global.graphCtx.beginPath();
        global.graphCtx.moveTo(global.gameWidth + global.screenWidth/2 - global.player.x,
                     global.screenHeight/2 - global.player.y);
        global.graphCtx.lineTo(global.gameWidth + global.screenWidth/2 - global.player.x,
                     global.gameHeight + global.screenHeight/2 - global.player.y);
        global.graphCtx.strokeStyle = global.borderColor;
        global.graphCtx.stroke();
    }

    // Bottom-horizontal.
    if (global.gameHeight - global.player.y <= global.screenHeight/2) {
        global.graphCtx.beginPath();
        global.graphCtx.moveTo(global.gameWidth + global.screenWidth/2 - global.player.x,
                     global.gameHeight + global.screenHeight/2 - global.player.y);
        global.graphCtx.lineTo(global.screenWidth/2 - global.player.x,
                     global.gameHeight + global.screenHeight/2 - global.player.y);
        global.graphCtx.strokeStyle = global.borderColor;
        global.graphCtx.stroke();        
    }
    global.graphCtx.globalAlpha = 1;
  
}


function drawPlayers(users) {
    var start = {
        x: global.player.x - (global.screenWidth / 2),
        y: global.player.y - (global.screenHeight / 2)
    };

   // console.log("Draw men "+global.player.x+":"+global.player.y);

    //drawMen(global.player.x, global.player.y, global.tecAngle,0); 


    for(var z=0; z<users.length; z++)
    { 
   // console.log(z+" = "+users[z].name+"   => "+users[z].x+":"+users[z].y);              
   
    
        var testMys = 0;
        var userCurrent = users[z];
        var crdUser = {
            x: userCurrent.x - start.x + 10,
            y: userCurrent.y - start.y + 10
        };
      
      /*  
        graph.strokeStyle = 'hsl(' + userCurrent.hue + ', 100%, 45%)';
        graph.fillStyle = 'hsl(' + userCurrent.hue + ', 100%, 50%)';
        graph.lineWidth = playerConfig.border;
        
        if (z===global.indexID)
        {
            testMys=1;
            if (userCurrent.nearZone)
                testMys=2;
        }
        */

       // global.graphCtx.drawImage(img, crdUser.x, crdUser.y, 30, 68);
        //drawMen(crdUser.x, crdUser.y, userCurrent.direct,testMys);      

        let indFr = Math.floor(global.currentFrame/global.framePerSec);
        
        if (global.target.x==0 && global.target.y==0)        
            global.currentFrame=0;    

        if (global.target.x==1 && global.target.y==0)
            direct=4;

        if (global.target.x==-1 && global.target.y==0)
            direct=0;

        if (global.target.x==0 && global.target.y==1)
            direct=6;

        if (global.target.x==0 && global.target.y==-1)
            direct=2;

         if (global.target.x==1 && global.target.y==1)
            direct=5;

        if (global.target.x==1 && global.target.y==-1)
            direct=3;

         if (global.target.x==-1 && global.target.y==1)
            direct=7;

        if (global.target.x==-1 && global.target.y==-1)
            direct=1;


        drawWalkMen(direct,indFr,crdUser.x, crdUser.y);

        global.currentFrame++;

        if (global.currentFrame>=global.framePerSec*8)
            global.currentFrame=0;
    }  
    
}


function showText(text)
{
    global.graphCtx.fillStyle ='#111111';
    global.graphCtx.font = 'bold 20px sans-serif';   
    global.graphCtx.fillText(text,100,100);

}

function drawWalkMen( direction,  frame, x,y) {

   global.graphCtx.drawImage(walker, 
                frame*128, direction*128, 128, 128,
                x,y,30,68
    );


}

function drawMen(centerX,centerY, peleng, showPeleng)
{    
    var i;
    var theta = 0;
    var x = 0;
    var y = 0;
    global.graphCtx.lineWidth = 2;
    global.graphCtx.strokeStyle = "#000000";
    global.graphCtx.beginPath();
    for ( i = 0; i < 20; i++) {
        theta = (i / 20) * 2 * Math.PI;
        x = centerX + 1.5 * Math.cos(theta);
        y = centerY + 4 * Math.sin(theta);
        global.graphCtx.lineTo(x, y);
    }
    global.graphCtx.closePath();
    global.graphCtx.stroke();
    global.graphCtx.fill();
    
   global.graphCtx.beginPath();
    for ( i = 0; i < 20; i++) {
        theta = (i / 20) * 2 * Math.PI;
        x = centerX + Math.cos(theta);
        y = (centerY-7) +  Math.sin(theta);
        global.graphCtx.lineTo(x, y);
    }
    global.graphCtx.closePath();
    global.graphCtx.stroke();
    global.graphCtx.fill();
    
    global.graphCtx.lineWidth = 0.5;
    global.graphCtx.beginPath();
    global.graphCtx.moveTo(centerX+2, centerY+3);
    global.graphCtx.lineTo(centerX+5,centerY+10);
    global.graphCtx.moveTo(centerX-2, centerY+3);
    global.graphCtx.lineTo(centerX-5,centerY+10);
    
        global.graphCtx.moveTo(centerX-2, centerY-1);
        global.graphCtx.lineTo(centerX+15*Math.cos(peleng),centerY+15*Math.sin(peleng));
        global.graphCtx.moveTo(centerX+2, centerY-1);
        global.graphCtx.lineTo(centerX+15*Math.cos(peleng),centerY+15*Math.sin(peleng));
    
    global.graphCtx.closePath();
    global.graphCtx.stroke();
    global.graphCtx.fill();
    
    if (showPeleng>0)
    {
        global.graphCtx.strokeStyle = 'hsl(' + global.indexFox*360/global.totalFoxes + ', 100%, 45%)';
        global.graphCtx.fillStyle = 'hsla(' + global.indexFox*360/global.totalFoxes + ', 100%, 50%,'+global.alfaCh+')';
        global.graphCtx.lineWidth = 0.01;
    
        global.graphCtx.beginPath();
        global.graphCtx.moveTo(centerX+15*Math.cos(peleng),centerY+15*Math.sin(peleng));
        if (showPeleng==1)
        {
            global.graphCtx.lineTo(centerX+2500*Math.cos(peleng-0.01)-5,centerY+2500*Math.sin(peleng-0.01));
            global.graphCtx.lineTo(centerX+2500*Math.cos(peleng+0.01)-5,centerY+2500*Math.sin(peleng+0.01));
        }
        if (showPeleng==2)
        {
            global.graphCtx.lineTo(centerX+300*Math.cos(peleng-0.1)-5,centerY+300*Math.sin(peleng-0.1));
            global.graphCtx.lineTo(centerX+300*Math.cos(peleng+0.1)-5,centerY+300*Math.sin(peleng+0.1));
        }
        global.graphCtx.lineTo(centerX+15*Math.cos(peleng),centerY+15*Math.sin(peleng));
        global.graphCtx.closePath();
        global.graphCtx.stroke();
        global.graphCtx.fill();
    }

}

function showMyText(text, prop){
    global.graphCtx.textAlign = 'center';
    global.graphCtx.fillStyle = prop.color;
    global.graphCtx.font = prop.font;
    global.graphCtx.fillText(text, prop.x, prop.y);
}

exports.showMyText = showMyText;
exports.drawPlayers = drawPlayers;
exports.drawgrid = drawgrid;