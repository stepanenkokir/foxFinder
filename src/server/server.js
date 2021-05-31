const express = require('express');
const app  = express();
const http = require('http').Server(app);
const io   = require('socket.io')(http);
const session = require("express-session");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const settings = require('../../settings.json');
const PORT = process.env.PORT || settings.port;

// Import utilities.
var util = require('./lib/util');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

redisStorage = require('connect-redis')(session);
redis = require('redis');
client = redis.createClient();

var players = {};

var session_store = new redisStorage({
      port: 6379,
      client: client,
    });

//Установка сессии
var sessionMiddleware = session({
    store: session_store,
    secret: "secret",
    resave: false,
    saveUninitialized: true    
});

app.use(cookieParser('secret'));
io.use(function(socket, next){  
  sessionMiddleware(socket.request, socket.request.res, next);  
});

app.use(sessionMiddleware);
app.use(express.static(__dirname + '/../client'));

// app.use(function (req, res, next) {
//   // console.log('Time:'+ Date.now()+  " req = "+req);
//   // next();
//   //res.send();
//   res.sendStatus(404);
// });

app.get('/', function (req, res) {
  // Cookies that have not been signed
  console.log('Cookies: ', req.cookies);
 
  // Cookies that have been signed
  console.log('Signed Cookies: ', req.signedCookies);
});

io.on('connection', (socket) => {
   
    sessID = socket.request.session.id;
    console.log("connection!!! work with sess ="+sessID);

    if (sessID in players)  
    {
       // console.log(" old sock = "+players[sessID].sock+" new sock = "+socket.id+" in sess"+sessID);
        players[sessID].sock = socket.id;       

    } 

    socket.on('firstConnect', function(){    
        sessID = socket.request.session.id;
        if (sessID in players)
        {
           // players[sessID].name=nName;
           // console.log("OLD PLAYER in game again "+sessID); 

            if (players[sessID].isLogin)
            {
                var serverData={};
                serverData.name = players[sessID].name;
                serverData.time = Date.now() - players[sessID].startTime;
                socket.emit("contGame",serverData);
            }
            else
                socket.emit("newPlayer");
            return;   
        }


        console.log("add new Player "+sessID); 
        players[sessID] ={                      
            sock      : socket.id,  
            isLogin   : false,
            name      : "",       
        };  

        socket.emit("newPlayer");
        

        // countOfPlayer = 0;
        // for(var id in players)
        //   countOfPlayer++;

        // console.log("Now count of Player =  "+countOfPlayer);        
      });
    
    socket.on('auth', function(nName){
        sessID = socket.request.session.id;
        players[sessID].name=nName;
        players[sessID].isLogin=true;
        players[sessID].startTime=Date.now();
        var serverData={};
        serverData.name = nName;
        serverData.time = -5;
        
        socket.emit("contGame",serverData);      
    });

    socket.on('startGame', function(){
        sessID = socket.request.session.id;
        players[sessID].started = true;
        console.log("Start game for "+ players[sessID].name +" from "+sessID);       
    });


    socket.on('windowResized', function (data) {
        currentPlayer.screenWidth = data.screenWidth;
        currentPlayer.screenHeight = data.screenHeight;
    });

});

http.listen(PORT, () => {
    console.log('Сервер слушает порт '+PORT);


});