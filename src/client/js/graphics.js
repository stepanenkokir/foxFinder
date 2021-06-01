
var global = require('./global');

var pl=global.playerXY;
function drawgrid() {

    console.log("show grid! ="+ global.xoffset+" : "+ global.screenWidth+" || "+global.yoffset+ " | "+global.plXY.x+":"+global.plXY.y);
    global.graphCtx.lineWidth = 1;
    global.graphCtx.strokeStyle = global.lineColor;
    global.graphCtx.globalAlpha = 1;
    global.graphCtx.beginPath();

    for (var x = global.xoffset - global.plXY.x; x < global.screenWidth; x += global.screenHeight / 20) {     
        global.graphCtx.moveTo(x, 0);
        global.graphCtx.lineTo(x, global.screenHeight);
    }

    for (var y = global.yoffset - global.plXY.y ; y < global.screenHeight; y += global.screenHeight / 20) {
        global.graphCtx.moveTo(0, y);
        global.graphCtx.lineTo(global.screenWidth, y);
    }
    global.graphCtx.stroke();
    global.graphCtx.globalAlpha = 1;
}

function drawborder() {
    global.graphCtx.lineWidth = 1;
    global.graphCtx.strokeStyle = playerConfig.borderColor;

    // Left-vertical.
    if (global.plXY.x <= global.screenWidth/2) {
        global.graphCtx.beginPath();
        global.graphCtx.moveTo(global.screenWidth/2 - global.plXY.x, 0 ? global.plXY.y > global.screenHeight/2 : global.screenHeight/2 - global.plXY.y);
        global.graphCtx.lineTo(global.screenWidth/2 - global.plXY.x, global.gameHeight + global.screenHeight/2 - global.plXY.y);
        global.graphCtx.strokeStyle = global.lineColor;
        global.graphCtx.stroke();
    }

    // Top-horizontal.
    if (global.plXY.y <= global.screenHeight/2) {
        global.graphCtx.beginPath();
        global.graphCtx.moveTo(0 ? global.plXY.x > global.screenWidth/2 : global.screenWidth/2 - global.plXY.x, global.screenHeight/2 - global.plXY.y);
        global.graphCtx.lineTo(global.gameWidth + global.screenWidth/2 - global.plXY.x, global.screenHeight/2 - global.plXY.y);
        global.graphCtx.strokeStyle = global.lineColor;
        global.graphCtx.stroke();
    }

    // Right-vertical.
    if (global.gameWidth - global.plXY.x <= global.screenWidth/2) {
        global.graphCtx.beginPath();
        global.graphCtx.moveTo(global.gameWidth + global.screenWidth/2 - global.plXY.x,
                     global.screenHeight/2 - global.plXY.y);
        global.graphCtx.lineTo(global.gameWidth + global.screenWidth/2 - global.plXY.x,
                     global.gameHeight + global.screenHeight/2 - global.plXY.y);
        global.graphCtx.strokeStyle = global.lineColor;
        global.graphCtx.stroke();
    }

    // Bottom-horizontal.
    if (global.gameHeight - global.plXY.y <= global.screenHeight/2) {
        global.graphCtx.beginPath();
        global.graphCtx.moveTo(global.gameWidth + global.screenWidth/2 - global.plXY.x,
                     global.gameHeight + global.screenHeight/2 - global.plXY.y);
        global.graphCtx.lineTo(global.screenWidth/2 - global.plXY.x,
                     global.gameHeight + global.screenHeight/2 - global.plXY.y);
        global.graphCtx.strokeStyle = global.lineColor;
        global.graphCtx.stroke();        
    }
}

exports.drawgrid = drawgrid;
exports.drawborder = drawborder;