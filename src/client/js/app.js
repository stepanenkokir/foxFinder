var socket;

document.body.oncontextmenu = function (e) {
    e.preventDefault();
};

var Canvas = require('./canvas');
var global = require('./global');
var System = require('./system');
var Graphics = require('./graphics');
var io = require('socket.io-client');

window.canvas = new Canvas();
var c = window.canvas.cv;
var graph = c.getContext('2d');
global.graphCtx = graph;

var pelengs = [];
var users= [];

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
    target:{ x:0,
    		 y:0,
    		 z1:0,
    		 y1:0,
    		 shift:false},
};
global.player = player;

var foxes = [];
var barriers = [];
var users = [];
var leaderboard = [];
var target = player.target;
global.target = target;


//window.addEventListener('keydown', function(event){console.log("Press key!!!");}, false);  

window.addEventListener('keydown', window.canvas.directionDown, false);    
window.addEventListener('keyup', window.canvas.directionUp, false); 

window.onload = function(){	

	if (!socket)
    {
    	startBrowser();
    }	   	
};

function startBrowser(){
	socket = io();
    setupSocket(socket);
}

function startPageShow(){
    document.getElementById("mainForm").appendChild(System.divAuth);
    var btnStart = document.getElementById('btnStart');
    var btnLogin = document.getElementById('btnLogin');
    var btnSignin = document.getElementById('btnSignin');

    btnStart.onclick = function () {
    	global.playerName=document.getElementById("playerName").value;
		if (global.playerName.length==0)
			global.playerName="Player";
		socket.emit('auth', global.playerName);
		document.getElementById("mainForm").removeChild(System.divAuth);	
    };	


    btnLogin.onclick = function () {    	
		document.getElementById("mainForm").removeChild(System.divAuth);	
		startLogin();
    };	


    btnSignin.onclick = function () {    	
		document.getElementById("mainForm").removeChild(System.divAuth);	
		startSignin();
    };	
}

function startLogin(){

 	document.getElementById("mainForm").appendChild(System.divLogin);
    var btnStart = document.getElementById('btnStart');
    
}

function startSignin(){
	document.getElementById("mainForm").appendChild(System.divSignin);
    var btnStart = document.getElementById('btnStart');
}

function startGame(type) {
    
    console.log("startGame");
    global.playerType = type;
    global.gameStart = true;
    global.disconnected = false;

	global.screenWidth = window.innerWidth;
    global.screenHeight = window.innerHeight;
    

	
   
     if (!global.animLoopHandle)
         animloop();
  
    window.canvas.socket = socket;
    global.socket = socket;
    pelengs.splice(0);

    System.debug("Sizescreen !!= "+global.screenWidth+":"+global.screenHeight + " ==> "+player.x+":"+player.y);
}


function myDirectionDown(event)
{

    var key = event.which || event.keyCode;

    console.log("Press Down!!! "+key);
    window.canvas.dddir(key);

}

function setupSocket(socket)
{
	socket.emit('firstConnect');

	socket.on("contGame", function(serverData) {			
		//document.getElementById("mainForm").appendChild(System.divInfo);
		//document.getElementById("mainForm").appendChild(System.miniMap);
		//document.getElementById("mainForm").appendChild(System.divStatus);
    	//document.getElementById("spanStatus").innerHTML=serverData.name+" В игре!!";	
    	//global.playerName = serverData.name;

    
    	//System.writeCookie('name',global.playerName,12);

		if (serverData.time<5)
    		countDown(2);
    	else
    	{    	
    		startGame('player');    				
    		socket.emit('startGame');
    			
    	}
	});

	socket.on("newPlayer", function() {	  
		startPageShow();         
	});

	socket.on('gameSetup', function(data) {
   		global.gameWidth = data.gameWidth;
    	global.gameHeight = data.gameHeight;
    	player.x = data.positions.x;
    	player.y = data.positions.y;
    	player.id=data.id;    	
    	console.log("CRD : "+data.positions.x+":"+data.positions.y);
    	resize();
    		
	});


	socket.on("moveInfo", function(usersInfo) {	  
		users=usersInfo;
		users.forEach(function(u){			
			if (u.id===player.id)
			{				
				let offsX = player.x - u.x;
				let offsY = player.y - u.y;			
				player.x = u.x;
    			player.y = u.y;
    			player.alfa=u.alfa;
			}
		});
	});



	socket.on("kick", function(info) {	  
		global.gameStart = false;
        console.log(info);
        socket.close();
        window.cancelAnimFrame(animloop);
        setTimeout(startBrowser,1000);
		graph.fillStyle = "#000000";
    	graph.fillRect(0, 0, global.screenWidth, global.screenHeight);
		Graphics.showMyText(info,{
        	color: "#FF0000",
        	font:'bold 30px sans-serif',
        	x:global.screenWidth/2,
        	y:100,
        });
	});

}

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
    			c.focus();											
			}			
		},0
	);	
}

System.divCloseBtn.onclick = function () {
    socket.emit('dscnct');
    global.disconnected=true;
};


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
	if (!global.disconnected){
	 	if(global.gameStart) {					

    		graph.fillStyle = global.backgroundColor;
    		graph.fillRect(0, 0, global.screenWidth, global.screenHeight);
    	
    		Graphics.drawgrid();  
    		Graphics.drawPlayers(users);              
                  
 		   	//foxes.forEach(drawFox);            
    		//barriers.forEach(drawBarriers);    
    		//pelengs.forEach(drawPelengs);    	 	  
    		//drawPlayers();
                
    		socket.emit('0', window.canvas.target); // playerSendTarget "Heartbeat".
		}
	}
	else{		
		graph.fillStyle ='#000000';		
    	graph.fillRect(0, 0, global.screenWidth, global.screenHeight);
		graph.fillStyle ='#FFFF00';
		graph.font = 'bold 40px sans-serif';
		graph.fillText('ОТКЛЮЧЕНИЕ...', global.screenWidth / 2-100, global.screenHeight / 2);
		window.cancelAnimationFrame(global.animLoopHandle);
		disconnectFromServer();
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
    }, 1000);
}




window.addEventListener('resize', resize);

function resize() {     
    if (!socket)
        return;           
 
    player.screenWidth = c.width = global.screenWidth = global.playerType == 'player' ? window.innerWidth : global.gameWidth;
    player.screenHeight = c.height = global.screenHeight = global.playerType == 'player' ? window.innerHeight : global.gameHeight;
      
    console.log("new size "+player.screenWidth+" : "+player.screenHeight+ "  type = "+global.playerType);
 
    socket.emit('windowResized', { screenWidth: global.screenWidth, screenHeight: global.screenHeight });
}
