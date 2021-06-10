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

var users= [];
var listOfTrees=[];
var listOfFoxes=[];


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
    target:{ st:0,
    		 direct:0,    		 
    		 shift:false},
};
global.player = player;

console.log("From start size = "+global.screenWidth+":"+global.screenHeight);

var foxes = {};
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
    //pelengs.splice(0);
    System.debug("Sizescreen !!= "+global.screenWidth+":"+global.screenHeight + " ==> "+player.x+":"+player.y);
}


function myDirectionDown(event)
{
    var key = event.which || event.keyCode;    
    window.canvas.dddir(key);
}

function setupSocket(socket)
{
	socket.emit('firstConnect');

	socket.on("contGame", function(serverData) {			

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
        global.id = data.id;  	
    	console.log("CRD : "+data.positions.x+":"+data.positions.y);
    	resize();
    		
	});


	socket.on("moveInfo", function(usersInfo, listTrees, listFox) {	  
		users=usersInfo;
        listOfFoxes = listFox;
        listOfTrees = listTrees;

		users.forEach(function(u){			
			if (u.id===global.id)
			{				
				let offsX = player.x - u.x;
				let offsY = player.y - u.y;			
				player.x = u.x;
    			player.y = u.y;
    			player.alfa=u.alfa;
                player.direct=u.direct;
			}
		});
	});

    socket.on("foxInfo", function(foxInfo, arrFox) {   
        foxes=foxInfo;
        global.findFox=arrFox;
            
    });

    socket.on("findFox", function(info){
        console.log("Find "+info.indx);       
    });

    socket.on("WIN", function(info){
        console.log("WIN!!!!");       
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
        	x:50,
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
            listOfFoxes.forEach(Graphics.drawFox);     
        	Graphics.drawPlayers(users);            
            Graphics.drawFoxStatus(foxes);  

                  
           // listOfTrees.forEach(Graphics.drawTrees);            
           // pelengs.forEach(Graphics.drawPelengs);                           

 		   	//foxes.forEach(drawFox);            
    		//barriers.forEach(drawBarriers);    
    		//pelengs.forEach(drawPelengs);    	 	              

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
    const koeffXY =  window.innerHeight/window.innerWidth;
   // player.screenWidth = c.width = global.screenWidth = (global.userScreenWidth<window.innerWidth) ? global.userScreenWidth:window.innerWidth;
    player.screenWidth = c.width = global.screenWidth = global.userScreenWidth;
    let sizeY=player.screenWidth*koeffXY;
   // player.screenHeight = c.height = global.screenHeight = (sizeY<window.innerHeight) ? sizeY:window.innerHeight;
    player.screenHeight = c.height = global.screenHeight = sizeY;

    global.realWidth = window.innerWidth;
    global.realHeight =  window.innerHeight;

    global.dpiX=c.width/window.innerWidth;
    global.dpiY=c.height/window.innerHeight;

 	console.log("new size "+player.screenWidth+" : "+player.screenHeight);
    socket.emit('windowResized', { screenWidth: global.screenWidth, screenHeight: global.screenHeight });
}
