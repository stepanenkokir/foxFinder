var Canvas = require('./canvas');
var global = require('./global');
var System = require('./system');

var io = require('socket.io-client');
var socket = io();

var pelengs = [];

window.canvas = new Canvas();
var c = window.canvas.cv;
var graph = c.getContext('2d');


var playerConfig = {
    border: 3,
    textColor: '#FFFFFF',
    textBorder: '#000000',
    textBorderSize: 3,
    defaultSize: 30
};

var player = {
    id: -1,
    x: global.screenWidth / 2,
    y: global.screenHeight / 2,
    screenWidth: global.screenWidth,
    screenHeight: global.screenHeight,    
    target: {x: global.screenWidth / 2, y: global.screenHeight / 2, radius: 10}
};
global.player = player;

var foxes = [];
var barriers = [];
var users = [];
var leaderboard = [];
var target = {x: player.x, y: player.y, x1: player.x1, y1: player.y1, radius: global.radius};
global.target = target;




socket.emit('firstConnect');

socket.on("contGame", function(serverData) {			
	document.getElementById("mainForm").appendChild(System.divInfo);
	document.getElementById("mainForm").appendChild(System.miniMap);
	document.getElementById("mainForm").appendChild(System.divStatus);
    document.getElementById("statusBox").innerHTML=serverData.name+" В игре!!";	
    global.playerName = serverData.name;
    System.writeCookie('name',serverData.name,12);
	if (serverData.time<5)
    	countDown(5);
    else
    	socket.emit('startGame');
});

socket.on("newPlayer", function() {	        
    
    document.getElementById("mainForm").appendChild(System.divAuth);

    var btn = document.getElementById('btnStart');
    btn.onclick = function () {
    	var nName=document.getElementById("playerName").value;
		if (nName.length==0)
			nName="Player";
			socket.emit('auth', nName);
			document.getElementById("mainForm").removeChild(System.divAuth);		
        };
});


function countDown(times) 
{	
	document.getElementById("mainForm").appendChild(System.divBlinkText1);		
	setTimeout( 
		function run(){	
		times--;	
			System.divBlinkText2.innerHTML=times;
			document.getElementById("mainForm").appendChild(System.divBlinkText2);								
			if (times>0)
				setTimeout(run,1000);
			else
			{					
				socket.emit('startGame');
				document.getElementById("mainForm").removeChild(System.divBlinkText1);		
				document.getElementById("mainForm").removeChild(System.divBlinkText2);
				global.gameStart = true;			
				startGame('player');						
			}			
		},0
	);	
}


function startGame(type) {
    
    global.playerType = type;

    global.screenWidth = window.innerWidth;
    global.screenHeight = window.innerHeight;
   
    if (!global.animLoopHandle)
        animloop();
   
    socket.emit('respawn');   
    window.canvas.socket = socket;
    global.socket = socket;
    pelengs.splice(0);

    System.debug("Sizescreen = "+global.screenWidth+":"+global.screenHeight);
}



window.requestAnimFrame = (function() {
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.msRequestAnimationFrame     ||
            function( callback ) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

window.cancelAnimFrame = (function(handle) {
    return  window.cancelAnimationFrame     ||
            window.mozCancelAnimationFrame;
})();

function animloop() {
    global.animLoopHandle = window.requestAnimFrame(animloop);
    gameLoop();
}



function gameLoop() {

	if (global.gameStart) {
    	graph.fillStyle = global.backgroundColor;
    	graph.fillRect(0, 0, global.screenWidth, global.screenHeight);

    	if (global.resize)
    	{               
        	resize();
        	global.resize = false;
    	}
    
    	if ((global.leftButtonPress)&&(global.onShowPeleng))
    	{
        	global.leftButtonPress = false;
        
        	pelengs.push({            
            	idF: global.indexFox,
            	x: player.x,
            	y: player.y,
            	alfa : global.alfaCh,
            	angle: global.tecAngle,            
            	hue: (global.indexFox*360/global.totalFoxes)
        	});
    	}


    	drawgrid();            
    	//foxes.forEach(drawFox);            
    	//barriers.forEach(drawBarriers);
    
    	//pelengs.forEach(drawPelengs);

    	if (global.borderDraw) {
        	drawborder();
    	}

    	//drawPlayers();
                
    	socket.emit('0', window.canvas.target); // playerSendTarget "Heartbeat".

	}
}

function drawgrid() {

	System.debug("show grid! ="+ global.xoffset+" : "+ global.screenWidth+" || "+global.yoffset+ " | "+player.x+":"+player.y);
     graph.lineWidth = 1;
     graph.strokeStyle = global.lineColor;
     graph.globalAlpha = 1;
     graph.beginPath();

    for (var x = global.xoffset - player.x; x < global.screenWidth; x += global.screenHeight / 20) {
        console.log("x = "+x);
        graph.moveTo(x, 0);
        graph.lineTo(x, global.screenHeight);
    }

    for (var y = global.yoffset - player.y ; y < global.screenHeight; y += global.screenHeight / 20) {
        graph.moveTo(0, y);
        graph.lineTo(global.screenWidth, y);
    }
    
  
    graph.stroke();
    graph.globalAlpha = 1;
}

function drawborder() {
    graph.lineWidth = 1;
    graph.strokeStyle = playerConfig.borderColor;

    // Left-vertical.
    if (player.x <= global.screenWidth/2) {
        graph.beginPath();
        graph.moveTo(global.screenWidth/2 - player.x, 0 ? player.y > global.screenHeight/2 : global.screenHeight/2 - player.y);
        graph.lineTo(global.screenWidth/2 - player.x, global.gameHeight + global.screenHeight/2 - player.y);
        graph.strokeStyle = global.lineColor;
        graph.stroke();
    }

    // Top-horizontal.
    if (player.y <= global.screenHeight/2) {
        graph.beginPath();
        graph.moveTo(0 ? player.x > global.screenWidth/2 : global.screenWidth/2 - player.x, global.screenHeight/2 - player.y);
        graph.lineTo(global.gameWidth + global.screenWidth/2 - player.x, global.screenHeight/2 - player.y);
        graph.strokeStyle = global.lineColor;
        graph.stroke();
    }

    // Right-vertical.
    if (global.gameWidth - player.x <= global.screenWidth/2) {
        graph.beginPath();
        graph.moveTo(global.gameWidth + global.screenWidth/2 - player.x,
                     global.screenHeight/2 - player.y);
        graph.lineTo(global.gameWidth + global.screenWidth/2 - player.x,
                     global.gameHeight + global.screenHeight/2 - player.y);
        graph.strokeStyle = global.lineColor;
        graph.stroke();
    }

    // Bottom-horizontal.
    if (global.gameHeight - player.y <= global.screenHeight/2) {
        graph.beginPath();
        graph.moveTo(global.gameWidth + global.screenWidth/2 - player.x,
                     global.gameHeight + global.screenHeight/2 - player.y);
        graph.lineTo(global.screenWidth/2 - player.x,
                     global.gameHeight + global.screenHeight/2 - player.y);
        graph.strokeStyle = global.lineColor;
        graph.stroke();
    }
}

window.addEventListener('resize', resize);

function resize() {     
    if (!socket)
        return;       
    if (global.resize)
    {
        console.log("GLOBAL resize!!!");
       // player.screenWidth = c.width = global.screenWidth = (global.screenWidth + global.radius);
      //  player.screenHeight = c.height = global.screenHeight = (global.screenHeight + global.radius);
    }
    else
    {     
        player.screenWidth = c.width = global.screenWidth = global.playerType == 'player' ? window.innerWidth : global.gameWidth;
        player.screenHeight = c.height = global.screenHeight = global.playerType == 'player' ? window.innerHeight : global.gameHeight;
    }
    
 
    socket.emit('windowResized', { screenWidth: global.screenWidth, screenHeight: global.screenHeight });
}
