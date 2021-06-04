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
	// let oldPlayerName =readCookie('name');
	// if (oldPlayerName===undefined || oldPlayerName=="indefined")
	let	oldPlayerName="Player";
	tHTML+="Ваше имя: <input autofocus id=\"playerName\" type=\"text\" value=\""+oldPlayerName+"\" /><br>";	
	tHTML+="<button class=\"w100\" id=\"btnStart\">Начать</button>";
	tHTML+="<div class=\"w100\"><button id=\"btnLogin\">Войти</button>";
	tHTML+="<button id=\"btnSignin\">Зарегистрироваться</button></div>";
	tHTML+="</div>";
	return tHTML;
}

function loginForm()
{	
	let tHTML="<div class=\"w100\">";	
	tHTML+="Ваше имя: <input autofocus id=\"playerName\" type=\"text\" /><br>";	
	tHTML+="E-mail:<input id=\"playerMail\" type=\"text\" /><br>";	
	tHTML+="Пароль:<input id=\"playerPasswd\" type=\"password\" /><br>";	
	tHTML+="<button class=\"w100\" id=\"btnStart\">Начать</button>";	
	tHTML+="</div>";
	return tHTML;
}

function signinForm()
{	
let tHTML="<div class=\"w100\"><table class=\"w75\">";	
	tHTML+="<tr><td>Ваше имя:</td><td><input autofocus id=\"playerName\" type=\"text\" /></td></tr>";	
	tHTML+="<tr><td>E-mail:</td><td><input id=\"playerMail\" type=\"text\" /></td></tr>";	
	tHTML+="<tr><td>Пароль:</td><td><input id=\"playerPasswd\" type=\"password\" /></td></tr>";	
	tHTML+="<tr><td>Повтор пароля:</td><td><input id=\"playerPasswd2\" type=\"password\" /></td></tr>";	
	tHTML+="<tr><td colspan=2><button class=\"w100\" id=\"btnStart\">Зарегистрировать</button></td></tr>";	
	tHTML+="</table></div>";	
	return tHTML;
}

var divAuth = document.createElement("div");
divAuth.id="authBox";
divAuth.innerHTML=authorizedForm();

var divLogin = document.createElement("div");
divLogin.id="loginBox";
divLogin.innerHTML=loginForm();

var divSignin= document.createElement("div");
divSignin.id="signinBox";
divSignin.innerHTML=signinForm();

var divInfo = document.createElement("div");
divInfo.id="infoBox";
var miniMap = document.createElement("div");
miniMap.id="miniMap";
var divStatus = document.createElement("div");
var spanStatus = document.createElement("span");
divStatus.id="statusBox";
spanStatus.id="spanStatus";


var divBlinkText1 = document.createElement("div");
var divBlinkText2 = document.createElement("div");
divBlinkText1.className="transition";
divBlinkText2.className="transition-scale";
divBlinkText1.innerHTML="ДО СТАРТА ";

var divCloseBtn = document.createElement("div");
divCloseBtn.className="cl-btn";
divCloseBtn.innerHTML="<div class=\"cl-btn-in\"><div class=\"cl-btn-txt\">ВЫХОД</div></div>";

divStatus.appendChild(divCloseBtn);
divStatus.appendChild(spanStatus);


exports.readCookie = readCookie;
exports.writeCookie = writeCookie;
exports.debug = debug;
exports.authorizedForm = authorizedForm;
exports.divAuth = divAuth;
exports.divLogin = divLogin;
exports.divSignin = divSignin;
exports.divInfo = divInfo;
exports.miniMap = miniMap;
exports.divStatus = divStatus;
exports.divCloseBtn = divCloseBtn;
exports.divBlinkText1 = divBlinkText1;
exports.divBlinkText2 = divBlinkText2;
