var Canvas = require('./canvas');
var global = require('./global');

var io = require('socket.io-client');


var socket = io();
var divAuth = document.createElement("div");
divAuth.id="authBox";

var divInfo = document.createElement("div");
divInfo.id="infoBox";

var miniMap = document.createElement("div");
miniMap.id="miniMap";

var divStatus = document.createElement("div");
divStatus.id="statusBox";




socket.emit('firstConnect');


socket.on("contGame", function(serverData) {	
	//document.getElementById("mainForm").removeChild(divAuth);
	//document.getElementById("mainForm").removeChild(divInfo);
	//document.getElementById("mainForm").removeChild(miniMap);
	//document.getElementById("mainForm").removeChild(divStatus);
	 document.getElementById("mainForm").appendChild(divInfo);
	 document.getElementById("mainForm").appendChild(miniMap);
	 document.getElementById("mainForm").appendChild(divStatus);
     document.getElementById("statusBox").innerHTML="Продолжаем игру!!";

});


socket.on("newPlayer", function(serverData) {	      
    
    divAuth.innerHTML=authorizedForm();
    document.getElementById("mainForm").appendChild(divAuth);
	//document.getElementById("authBox").innerHTML=serverData;
});


function pressSomething(data)
{
	console.log("Press "+data);
}

function startGame()
{	
	let nName=document.getElementById("playerName").value;
	if (nName.length==0)
		nNmae="Player";
	socket.emit('startGame', nName);
	document.getElementById("mainForm").removeChild(divAuth);	
}

function authorizedForm()
{
	let tHTML="<div class=\"w100\">";

	tHTML+="Ваше имя: <input autofocus id=\"playerName\" type=\"text\" placeholder=\"Name\" /><br>";	
	tHTML+="<button class=\"w100\" onclick=\"startGame()\">Начать</button>";
	tHTML+="</div>";

	return tHTML;
}


