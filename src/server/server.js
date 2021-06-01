const express = require('express');
const app  = express();
const http = require('http').Server(app);
const io   = require('socket.io')(http);
const session = require("express-session");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const settings = require('../../settings.json');
const PORT = process.env.PORT || settings.port;

var util = require('./lib/util');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

redisStorage = require('connect-redis')(session);
redis = require('redis');
client = redis.createClient();

var players = [];

var session_store = new redisStorage({
      port: 6379,
      client: client,
    });

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

io.on('connection', (socket) => {
   
    sessID = socket.request.session.id;
    console.log("connection!!! work with sess ="+sessID);

    if (sessID in players)  
    {       
        console.log("SESSOIN in Players");
        players[sessID].sock = socket.id;       
    } 
    else
        console.log("SESSOIN OUT Players");

    socket.on('firstConnect', function(){    
        sessID = socket.request.session.id;
        if (sessID in players)
        {
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

        console.log("New connection: "+sessID); 
        players[sessID] ={                      
            sock      : socket.id,  
            isLogin   : false,
            name      : "",       
        };  

        socket.emit("newPlayer");
        

        // countOfPlayer = 0;
        // for(var id in players)
        //   countOfPlayer++;
        
      });

    
    socket.on('auth', function(nName){
      //  console.log("Auth = "+nName);
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
        console.log("Count of player = "+players.length); 

        socket.emit('gameSetup', {
                gameWidth: settings.gameWidth,
                gameHeight: settings.gameHeight
            });     
    });

    socket.on('dscnct', function(){
        sessID = socket.request.session.id;
       // players[sessID].started = true;
        console.log("DISCONNECTED game for "+sessID);       
    });


    socket.on('windowResized', function (data) {
       // currentPlayer.screenWidth = data.screenWidth;
       // currentPlayer.screenHeight = data.screenHeight;
    });

});

http.listen(PORT, () => {
    console.log('Сервер слушает порт '+PORT);


});