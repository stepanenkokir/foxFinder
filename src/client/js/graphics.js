
var global = require('./global');

let walker = new Image();
// Назначение путь до картинки
walker.src = "/image/walk.png";

function toDeg(rad){
    deg = 180*rad/Math.PI;
    if (deg<0)deg+=360;
    if (deg>360)deg-=360;
    return deg;
}

function drawgrid() {
   // showMyText(Math.floor(global.player.x)+":"+Math.floor(global.player.y),{x:10,y:50});
  //  showMyText(Math.floor(global.player.x)+":"+Math.floor(global.player.y),{color:"rgba(0,0,0,1)",font:"16px Georgia",x:100,y:100});
    global.graphCtx.lineWidth = 1;   
    global.graphCtx.strokeStyle = global.lineColor;   
    global.graphCtx.beginPath();
    var sizeXY=100;
    //var testX = -global.player.x%(global.screenHeight / 10);
    //var testY = -global.player.y%(global.screenHeight / 10);        
    
    var testX = -global.player.x%sizeXY;
    var testY = -global.player.y%sizeXY;     

    for (var x = testX; x < global.screenWidth; x += sizeXY) {     
        global.graphCtx.moveTo(x, 0);
        global.graphCtx.lineTo(x, global.screenHeight);        
    }     
    for (var y = testY; y < global.screenHeight; y += sizeXY) {
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

function timeInStr(time){
    let hh = "0"+Math.floor(time/3600);
    let mm = "0"+Math.floor(time/60)%60;
    //let ss = time - (3600*hh + 60*mm);
    let ss = "0"+(time%60).toFixed(1);


    return hh.substr(-2)+":"+mm.substr(-2)+":"+ss.substr(-4);
}

function drawFoxStatus(statusFox={id:0, clr:"#FFFF00", time:0.6, timeInGame:0}){

    var ww = global.screenWidth*0.8;
    var hh = global.screenWidth*0.02;
    var fnt=hh+"px Verdana";
    global.indexFox = statusFox.id;

    global.graphCtx.beginPath();
//    global.graphCtx.fillStyle = statusFox.clr;
    global.graphCtx.fillStyle = 'hsl(' + global.indexFox*72 + ', 100%, 45%)';
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



    ww=global.screenWidth*0.1655;
    fnt=hh+"px Arial";
    global.graphCtx.beginPath();
    
    for (let i=0;i<6;i++)
    {
        var textStr = "Лиса "+i;
        if (i>0)
        {
            let indF=(i-1);
            
            global.graphCtx.fillStyle = 'hsl(' + 72*(i-1) + ', 100%, 45%)';
            global.graphCtx.rect(2+i*ww, global.screenHeight-hh, ww, hh-3);
            global.graphCtx.fillRect(3+i*ww, global.screenHeight-hh+1, ww-2, hh-5);  

                   
                        
            if (isNaN(global.findFox[indF]) || global.findFox[indF]===undefined || global.findFox[indF]===0)
                textStr+=":    Не найдена";
            else
                textStr+=":   "+timeInStr(global.findFox[indF]);
                    
            showMyText(textStr, {color:"#000000",font:"18px Georgia",x:10+i*ww,y:global.screenHeight-8});
        }
        else
        {
            global.graphCtx.fillStyle = "#FFFFFF";           
            global.graphCtx.rect(2+i*ww, global.screenHeight-hh, ww, hh-3);
            global.graphCtx.fillRect(3+i*ww, global.screenHeight-hh+1, ww-2, hh-5);        
            textStr="Время: "+timeInStr(statusFox.timeInGame);
            showMyText(textStr, {color:"#000000",font:"18px Georgia",x:10+i*ww,y:global.screenHeight-8});
        }

        
    }

    global.graphCtx.stroke();
    
   
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
            

        var crdUser = {
            x: users[z].x - start.x,
            y: users[z].y - start.y,                            
        };      
        let indFr = Math.floor(users[z].frame.f2/global.framePerSec)%8;  

        drawWalkMen(users[z].frame.f1,indFr,crdUser.x-50, crdUser.y-50); 

        

        if (users[z].id==global.id)
        {
            infoFox=toDeg(users[z].foxInfo.angl)+" : "+users[z].foxInfo.dist;
          //  showMyText  (infoFox, {color:"rgba(0,0,0,1)",font:"16px Georgia",x:100,y:300});   

            /*
            //линия курса  
            global.graphCtx.beginPath();
            global.graphCtx.lineWidth = 1;
            global.graphCtx.strokeStyle = "#111111";
            global.graphCtx.moveTo(crdUser.x, crdUser.y);                    
            global.graphCtx.lineTo(crdUser.x+50*Math.cos(global.tecAngle),crdUser.y+50*Math.sin(global.tecAngle));            
            global.graphCtx.stroke();
            */

            //пеленг

            global.graphCtx.strokeStyle = 'hsl(' + global.indexFox*72 + ', 100%, 45%)';
            if (global.toFinish)
                global.graphCtx.fillStyle = 'rgba(10,10,10,'+users[z].alfa+')';
            else
                global.graphCtx.fillStyle = 'hsla(' + global.indexFox*72 + ', 100%, 50%,'+users[z].alfa+')';
            global.graphCtx.lineWidth = 0.01;
    
            global.graphCtx.beginPath();
            //const pntX1,pntX2,pntX3,pntY1,pntY2,pntY3;               
            let pntX1=crdUser.x+15*Math.cos(global.tecAngle);
            let pntY1=crdUser.y+15*Math.sin(global.tecAngle);                                    
            let pntX2=crdUser.x+2500*Math.cos(global.tecAngle-0.01)-5;
            let pntY2=crdUser.y+2500*Math.sin(global.tecAngle-0.01);
            let pntX3=crdUser.x+2500*Math.cos(global.tecAngle+0.01)-5;
            let pntY3=crdUser.y+2500*Math.sin(global.tecAngle+0.01);                        
            
            if (users[z].nearZone)
            {
                pntX2=crdUser.x+300*Math.cos(global.tecAngle-0.05)-5;
                pntY2=crdUser.y+300*Math.sin(global.tecAngle-0.05);
                pntX3=crdUser.x+300*Math.cos(global.tecAngle+0.05)-5;
                pntY3=crdUser.y+300*Math.sin(global.tecAngle+0.05);                                        
            }

            global.graphCtx.moveTo(pntX1,pntY1);
            global.graphCtx.lineTo(pntX2,pntY2);
            global.graphCtx.lineTo(pntX3,pntY3);
            global.graphCtx.lineTo(pntX1,pntY1);
            global.graphCtx.closePath();
            global.graphCtx.stroke();
            global.graphCtx.fill();

            if (global.leftButtonPress && !global.toFinishw &&  global.findFox[global.indexFox]===0)
            {
                global.leftButtonPress = false;                            
                global.pelengs.push({ 
                    id:global.indexFox, 
                    alfa:users[z].alfa,
                    angle:global.tecAngle,
                    x:users[z].x,
                    y:users[z].y                    
                });
            }
        }        
    }
    
    global.pelengs.forEach(drawPelengs);  
}

function drawWalkMen( direction,  frame, x,y) {
    global.graphCtx.drawImage(walker, 
                 frame*128, direction*128, 128, 128,
                 x,y,100,100    );
    global.mainX = x;
    global.mainY = y;
}

function drawEllipse(centerX, centerY, radiusX, radiusY, sides) {
    var theta = 0;
    var x = 0;
    var y = 0;

    global.graphCtx.beginPath();
    for (var i = 0; i < sides; i++) {
        theta = i *2* Math.PI / sides;
        x = centerX + radiusX * Math.sin(theta);
        y = centerY + radiusY * Math.cos(theta);
        global.graphCtx.lineTo(x, y);
    }

    const ddX = (centerX - global.mainX )/20;
    const ddY = (centerY - global.mainY )/20;
    global.graphCtx.shadowColor = "#777777";
    global.graphCtx.shadowBlur = 40;
    global.graphCtx.shadowOffsetX = ddX;
    global.graphCtx.shadowOffsetY = ddY;
    global.graphCtx.closePath();
    global.graphCtx.stroke();
    global.graphCtx.fill();

    global.graphCtx.shadowColor = "#000000";
    global.graphCtx.shadowBlur = 0;
    global.graphCtx.shadowOffsetX = 0;
    global.graphCtx.shadowOffsetY = 0;
}

function drawFox(foxes){

    global.graphCtx.strokeStyle = 'hsl(' + foxes.hue + ', 100%, 45%)';
    global.graphCtx.fillStyle = 'hsl(' + foxes.hue + ', 100%, 50%)';
    global.graphCtx.lineWidth = 1;
    drawEllipse(foxes.x - global.player.x + global.screenWidth / 2,
               foxes.y - global.player.y + global.screenHeight / 2,
               foxes.radius, foxes.radius, 6);
    global.graphCtx.strokeText(foxes.id+1, foxes.x - global.player.x + global.screenWidth / 2 , foxes.y - global.player.y + global.screenHeight / 2 -7);
}

function drawTrees(trees){

    global.graphCtx.strokeStyle = 'hsla(' + trees.stroke + ', 100%, 50%, 0.5)';
    global.graphCtx.fillStyle = 'hsla(' + trees.fill + ', 100%, 50%, 1)'; 
    global.graphCtx.lineWidth = 0.01;//trees.strokeWidth;
    drawEllipse(trees.x - global.player.x + global.screenWidth / 2 +10,
               trees.y - global.player.y + global.screenHeight / 2 + 10,
               trees.radiusX,trees.radiusY, 25);   
}

function drawPelengs(peleng){


    global.graphCtx.strokeStyle = 'hsl(' + peleng.id*72 + ', 100%, 45%)';
    global.graphCtx.fillStyle = 'hsla(' + peleng.id*72 + ', 100%, 50%,'+peleng.alfa+')';
    global.graphCtx.lineWidth = 0.01;
    var centerX = peleng.x - global.player.x + global.screenWidth / 2;
    var centerY = peleng.y - global.player.y + global.screenHeight / 2;

    global.graphCtx.beginPath();
    global.graphCtx.moveTo(centerX+15*Math.cos(peleng.angle),centerY+15*Math.sin(peleng.angle));
    
    global.graphCtx.lineTo(centerX+5000*Math.cos(peleng.angle-0.01)-5,centerY+5000*Math.sin(peleng.angle-0.01));
    global.graphCtx.lineTo(centerX+5000*Math.cos(peleng.angle+0.01)-5,centerY+5000*Math.sin(peleng.angle+0.01));
    
    global.graphCtx.lineTo(centerX+15*Math.cos(peleng.angle),centerY+15*Math.sin(peleng.angle));
    global.graphCtx.closePath();
    global.graphCtx.stroke();
    global.graphCtx.fill();

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
exports.drawFox=drawFox;
exports.drawTrees=drawTrees;
exports.drawPelengs=drawPelengs;