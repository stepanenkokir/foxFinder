
var global = require('./global');

let walker = new Image();
// Назначение путь до картинки
walker.src = "/image/walk.png";


function drawgrid() {
   // showMyText(Math.floor(global.player.x)+":"+Math.floor(global.player.y),{x:10,y:50});
    showMyText(Math.floor(global.player.x)+":"+Math.floor(global.player.y),{color:"rgba(0,0,0,1)",font:"16px Georgia",x:100,y:100});
    global.graphCtx.lineWidth = 1;   
    global.graphCtx.strokeStyle = global.lineColor;   
    global.graphCtx.beginPath();
    var testX = -global.player.x%(global.screenHeight / 10);
    var testY = -global.player.y%(global.screenHeight / 10);        
    for (var x = testX; x < global.screenWidth; x += global.screenHeight / 10) {     
        global.graphCtx.moveTo(x, 0);
        global.graphCtx.lineTo(x, global.screenHeight);        
    }     
    for (var y = testY; y < global.screenHeight; y += global.screenHeight / 10) {
        global.graphCtx.moveTo(0, y);
        global.graphCtx.lineTo(global.screenWidth, y);
    }
    global.graphCtx.stroke();
    
    global.graphCtx.strokeStyle =  global.borderColor;
    global.graphCtx.lineWidth = 5;    
    global.graphCtx.beginPath();
    if (global.player.x <= global.screenWidth/2) {    
        
        global.graphCtx.moveTo(global.screenWidth/2 - global.player.x, 0 ? global.player.y > global.screenHeight/2 : global.screenHeight/2 - global.player.y);
        global.graphCtx.lineTo(global.screenWidth/2 - global.player.x, global.gameHeight + global.screenHeight/2 - global.player.y);
    }

    if (global.player.y <= global.screenHeight/2) {
        
        global.graphCtx.moveTo(0 ? global.player.x > global.screenWidth/2 : global.screenWidth/2 - global.player.x, global.screenHeight/2 - global.player.y);
        global.graphCtx.lineTo(global.gameWidth + global.screenWidth/2 - global.player.x, global.screenHeight/2 - global.player.y);              
    }
    
    if (global.gameWidth - global.player.x <= global.screenWidth/2) {        
        
        global.graphCtx.moveTo(global.gameWidth + global.screenWidth/2 - global.player.x,
                     global.screenHeight/2 - global.player.y);
        global.graphCtx.lineTo(global.gameWidth + global.screenWidth/2 - global.player.x,
                     global.gameHeight + global.screenHeight/2 - global.player.y);                
    }

    if (global.gameHeight - global.player.y <= global.screenHeight/2) {        
        
        global.graphCtx.moveTo(global.gameWidth + global.screenWidth/2 - global.player.x,
                     global.gameHeight + global.screenHeight/2 - global.player.y);
        global.graphCtx.lineTo(global.screenWidth/2 - global.player.x,
                     global.gameHeight + global.screenHeight/2 - global.player.y);            
    }                
    global.graphCtx.stroke();      
}

function drawMiniMap(){

}

function drawFoxStatus(statusFox={id:0, clr:"#FFFF00", time:0.6}){

    var ww = global.screenWidth*0.8;
    var hh = global.screenWidth*0.02;
    var fnt=hh+"px Verdana";
    global.graphCtx.beginPath();
    global.graphCtx.fillStyle = statusFox.clr;
    global.graphCtx.strokeStyle =  "#000000";
    global.graphCtx.globalAlpha = 1;
    global.graphCtx.lineWidth = 1;    
    global.graphCtx.rect(global.screenWidth-ww-2, 2, ww, hh);
    global.graphCtx.fillRect(2+global.screenWidth-ww, 2, ww*statusFox.time, hh);
    global.graphCtx.stroke();
    global.graphCtx.beginPath();
    global.graphCtx.fillStyle = "#FFFFFF";
    global.graphCtx.rect(2, 2,global.screenWidth-ww-6, hh);
    global.graphCtx.fillRect(3, 3,global.screenWidth-ww-8, hh-2);        
    global.graphCtx.stroke();
    let text="Активна "+(statusFox.id+1)+"я лиса!";
    showMyText(text, {color:"#000000",font:fnt,x:15,y:hh-5});
}

function drewLeaderBoard(leaderBoard){

}

function drawPlayers(users) {
    var start = {
        x: global.player.x - (global.screenWidth / 2),
        y: global.player.y - (global.screenHeight / 2)
    };

    for(var z=0; z<users.length; z++)
    { 
        var testMys = 0;       
        var crdUser = {
            x: users[z].x - start.x,
            y: users[z].y - start.y,                            
        };      
        let indFr = Math.floor(users[z].frame.f2/global.framePerSec)%8;  

        drawWalkMen(users[z].frame.f1,indFr,crdUser.x-50, crdUser.y-50); 

        infoFox=users[z].foxInfo.angl*180/Math.PI+" : "+users[z].foxInfo.dist;
        showMyText  (infoFox, {color:"rgba(0,0,0,1)",font:"16px Georgia",x:100,y:300});     

        if (users[z].id==global.id)
        {
            global.graphCtx.beginPath();
            global.graphCtx.lineWidth = 1;
            global.graphCtx.strokeStyle = "#111111";
            global.graphCtx.moveTo(crdUser.x, crdUser.y);                    
            global.graphCtx.lineTo(crdUser.x+50*Math.cos(global.tecAngle),crdUser.y+50*Math.sin(global.tecAngle));            
            global.graphCtx.stroke();
        }        

    }
}
function drawWalkMen( direction,  frame, x,y) {


    global.graphCtx.drawImage(walker, 
                 frame*128, direction*128, 128, 128,
                 x,y,100,100    );
}

function showMyText(text, prop={color:"#cccccc",font:"16px Georgia",x:10,y:10}){ 

    global.graphCtx.fillStyle = prop.color;
    global.graphCtx.font = prop.font;
    global.graphCtx.fillText(text, prop.x, prop.y);

}

exports.showMyText = showMyText;
exports.drawPlayers = drawPlayers;
exports.drawgrid = drawgrid;
exports.drawMiniMap = drawMiniMap;
exports.drawFoxStatus = drawFoxStatus;
exports.drewLeaderBoard = drewLeaderBoard;