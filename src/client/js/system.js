function readCookie(name) {
	var matches = document.cookie.match(new RegExp(
    	"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  	));  	
  	return matches ? decodeURIComponent(matches[1]) : undefined;
}

function writeCookie(name, val, expires) {	
  	var date = new Date();
  	date.setDate(date.getDate() + expires);
  	document.cookie = name+"="+val+"; path=/; expires=" + date.toUTCString();
}


function debug(args) {
    if (console && console.log) {
        console.log(args);
    }
}

function authorizedForm()
{	
	let tHTML="<div class=\"w100\">";
	let oldPlayerName =readCookie('name');
	tHTML+="Ваше имя: <input autofocus id=\"playerName\" type=\"text\" value=\""+(oldPlayerName?oldPlayerName:"Player")+"\" /><br>";	
	tHTML+="<button class=\"w100\" id=\"btnStart\">Начать</button>";
	tHTML+="</div>";
	return tHTML;
}

var divAuth = document.createElement("div");
divAuth.id="authBox";
divAuth.innerHTML=authorizedForm();

var divInfo = document.createElement("div");
divInfo.id="infoBox";
var miniMap = document.createElement("div");
miniMap.id="miniMap";
var divStatus = document.createElement("div");
divStatus.id="statusBox";

var divBlinkText1 = document.createElement("div");
var divBlinkText2 = document.createElement("div");
divBlinkText1.className="transition";
divBlinkText2.className="transition-scale";
divBlinkText1.innerHTML="ДО СТАРТА ";




exports.readCookie = readCookie;
exports.writeCookie = writeCookie;
exports.debug = debug;
exports.authorizedForm = authorizedForm;
exports.divAuth = divAuth;
exports.divInfo = divInfo;
exports.miniMap = miniMap;
exports.divStatus = divStatus;
exports.divBlinkText1 = divBlinkText1;
exports.divBlinkText2 = divBlinkText2;
