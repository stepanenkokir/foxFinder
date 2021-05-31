var Canvas = require('./canvas');
var Global = require('./global');
var System = require('./system');

var io = require('socket.io-client');

console.log("START");

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

	
	console.log("CONT GAME in time = "+serverData.name+ " == "+serverData.time);

	 document.getElementById("mainForm").appendChild(divInfo);
	 document.getElementById("mainForm").appendChild(miniMap);
	 document.getElementById("mainForm").appendChild(divStatus);
     document.getElementById("statusBox").innerHTML=serverData.name+" В игре!!";	
     System.writeCookie('name',serverData.name,12);
});


socket.on("newPlayer", function() {	        
    divAuth.innerHTML=authorizedForm();
    document.getElementById("mainForm").appendChild(divAuth);

    var btn = document.getElementById('btnStart');

    btn.onclick = function () {
    	let nName=document.getElementById("playerName").value;
		if (nName.length==0)
			nName="Player";
			socket.emit('startGame', nName);
			document.getElementById("mainForm").removeChild(divAuth);	
		
        };

});


function authorizedForm()
{
	let tHTML="<div class=\"w100\">";

	let oldPlayerName =System.readCookie('name')?System.readCookie('name'):"Player";	
	tHTML+="Ваше имя: <input autofocus id=\"playerName\" type=\"text\" value=\""+oldPlayerName+"\" /><br>";	
	tHTML+="<button class=\"w100\" id=\"btnStart\">Начать</button>";
	tHTML+="</div>";

	return tHTML;
}



