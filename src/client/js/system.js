exports.readCookie = function(name) {

	var matches = document.cookie.match(new RegExp(
    	"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  	));

  	console.log("Read cookie "+name);
  	return matches ? decodeURIComponent(matches[1]) : undefined;
};

exports.writeCookie = function(name, val, expires) {
	console.log("Save cookie "+name);
  	var date = new Date();
  	date.setDate(date.getDate() + expires);
  	document.cookie = name+"="+val+"; path=/; expires=" + date.toUTCString();
};

