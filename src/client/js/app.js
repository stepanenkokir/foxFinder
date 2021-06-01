var Canvas = require('./canvas');
var global = require('./global');
var System = require('./system');
var Graphics = require('./graphics');

var io = require('socket.io-client');
var socket = io();

var pelengs = [];

window.canvas = new Canvas();
var c = window.canvas.cv;
var graph = c.getContext('2d');

document.body.oncontextmenu = null;
window.addEventListener("mousemove", stopEventPropagation, true); //disable background elements activity


function stopEventPropagation(event) {
    event.stopImmediatePropagation();
}


global.graphCtx = graph;


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
    document.getElementById("spanStatus").innerHTML=serverData.name+" В игре!!";	
    global.playerName = serverData.name;
    System.writeCookie('name',serverData.name,12);
	if (serverData.time<5)
    	countDown(2);
    else
    {
    	

    	socket.emit('startGame');
    	startGame('player');	
    }
});

socket.on("newPlayer", function() {	  
	startPageShow();         
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
				startGame('player');						
			}			
		},0
	);	
}


System.divCloseBtn.onclick = function () {
    socket.emit('dscnct');
    global.disconnected=true;
};

function startGame(type) {
    
    console.log("startGame");
    global.playerType = type;
    global.gameStart = true;
    global.disconnected = false;

    global.screenWidth = window.innerWidth;
    global.screenHeight = window.innerHeight;
   
     if (!global.animLoopHandle)
         animloop();
   
    // socket.emit('respawn');   
    // window.canvas.socket = socket;
    // global.socket = socket;
    // pelengs.splice(0);

    System.debug("Sizescreen !!= "+global.screenWidth+":"+global.screenHeight);
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

//console.log("GameLoop "+global.gameStart+ " = "+global.disconnected);
	

	if (!global.disconnected && global.gameStart) {
		
		global.plXY ={x:player.x,y:player.y};

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


    	Graphics.drawgrid();            
    	//foxes.forEach(drawFox);            
    	//barriers.forEach(drawBarriers);
    
    	//pelengs.forEach(drawPelengs);

    	//if (global.borderDraw) drawborder();
    	

    	//drawPlayers();
                
    	socket.emit('0', window.canvas.target); // playerSendTarget "Heartbeat".

	}
	else{
		if (global.disconnected)
		{
			graph.fillStyle ='#000000';
			
    		graph.fillRect(0, 0, global.screenWidth, global.screenHeight);
			graph.fillStyle ='#FFFF00';
			graph.font = 'bold 40px sans-serif';
			graph.fillText('ОТКЛЮЧЕНИЕ...', global.screenWidth / 2-100, global.screenHeight / 2);
			window.cancelAnimationFrame(global.animLoopHandle);
			disconnectFromServer();
		}
	}
}

function disconnectFromServer(){
	global.gameStart = false;
    global.died = true;

	console.log(0);
    document.getElementById("mainForm").removeChild(System.divInfo);
    console.log(1);
	document.getElementById("mainForm").removeChild(System.miniMap);
	console.log(2);
	document.getElementById("mainForm").removeChild(System.divStatus);
	console.log(3);

    window.setTimeout(function() {
    	graph.fillStyle ='#000000';		
    	graph.fillRect(0, 0, global.screenWidth, global.screenHeight);
        startPageShow();
        global.died = false;
        if (global.animLoopHandle) {
            window.cancelAnimationFrame(global.animLoopHandle);
            global.animLoopHandle = undefined;
        }
    }, 2500);
}

function startPageShow(){
    document.getElementById("mainForm").appendChild(System.divAuth);
    var btn = document.getElementById('btnStart');
    btn.onclick = function () {
    	var nName=document.getElementById("playerName").value;
		if (nName.length==0)
			nName="Player";
			socket.emit('auth', nName);
			document.getElementById("mainForm").removeChild(System.divAuth);		
        };	
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
