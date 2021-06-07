const express = require('express');
const app  = express();
const http = require('http').Server(app);
const io   = require('socket.io')(http);
const session = require("express-session");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const settings = require('../../settings.json');
const path = require('path');
const PORT = process.env.PORT || settings.port;

var util = require('./lib/util');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

redisStorage = require('connect-redis')(session);
redis = require('redis');
client = redis.createClient();

var players = {};
var playersInfo=[];
var sockets={};

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

app.get('/image/:fileName', (req, res, next) => {
  res.type('png');
 // console.log("try send image "+req.params.fileName);
  res.sendFile(
    path.resolve(`${path.join(__dirname, '../client/images')}/${req.params.fileName}`)
  );
});



io.on('connection', function(socket){
    sessID = socket.request.session.id;
    var position = util.startPosition(settings.startPositions.r /2);
    console.log("connection!!! work with sess ="+sessID + " positions = "+position.x+" : "+position.y);
    
    socket.on('firstConnect', function(){    
        sessID = socket.request.session.id;
        if (sessID in players)
        {
            if (players[sessID].isLogin)
            {
                var serverData={};
                serverData.name = players[sessID].name;
                serverData.time = Date.now() - players[sessID].startTime;
                position.x = players[sessID].x;
                position.y = players[sessID].y;
                socket.emit("contGame",serverData);

                console.log("OLD!!!");
            }
            else
            {
                console.log("NEW!!!");
                socket.emit("newPlayer");
            }
            return;   
        }

        console.log("New connection: "+sessID); 
        players[sessID] ={                                 
            isLogin   : false,
            name      : "", 
            started   : false,  
            lastHeartbeat : 0,                
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
        sockets[sessID] = socket;
        players[sessID].lastHeartbeat = new Date().getTime();
        players[sessID].id = sessID;
        players[sessID].target={x:0,y:0,x1:0,y1:0, shift:false};
        players[sessID].x=position.x;
        players[sessID].y=position.y;
        players[sessID].radius = 10;
        players[sessID].speed = 1;

        console.log("Start game for "+ players[sessID].name +" from "+sessID);        

        socket.emit('gameSetup', {
                gameWidth: settings.gameWidth,
                gameHeight: settings.gameHeight,
                positions: position,
                id:sessID,
            });     
    });

    socket.on('dscnct', function(){                
        disconnectSock(socket.request.session.id);
    });


    socket.on('windowResized', function (data) {
       // console.log("Window resize!!");
       // currentPlayer.screenWidth = data.screenWidth;
       // currentPlayer.screenHeight = data.screenHeight;
    });

   // Heartbeat function, update everytime.
    socket.on('0', function(target) {
        sessID = socket.request.session.id;
        if (sessID in players)
        {
       // console.log("FROM CLIENT!!  "+players[sessID].name + " going to "+target.x+":"+target.y+":"+target.x1+":"+target.y1);
            players[sessID].lastHeartbeat = new Date().getTime();
           // if (target.x !== players[sessID].target.x || target.y !== players[sessID].target.y) {
                players[sessID].target = target;
            //}
        }        
    });
});

function disconnectSock(sID){
    
    delete players[sID];
    delete sockets[sID];
    console.log("DISCONNECTED game for "+sID);      
}

setInterval(moveloop, 1000 / 60);
setInterval(gameloop, 1000);
setInterval(sendUpdates, 1000 / settings.networkUpdateFactor);


function movePlayer(player) {

    var x =0,y =0;
    var prCol = false;
    var target = {
        x: player.target.x,
        y: player.target.y,  
        x1: player.target.x1,
        y1: player.target.y1,
        shift: player.target.shift, 
    };   
    
   // console.log("MyTarget = "+target.x+" : "+target.y+" : "+target.x1+" : "+ target.y1);
    var newPlayer = {x:0, y:0}; 
/*
    var dist = Math.sqrt(Math.pow(target.y, 2) + Math.pow(target.x, 2));
    var deg = Math.atan2(target.y, target.x);
    if (deg<0)
            deg+=2*Math.PI;
    
    var deg1 = Math.atan2((foxes[indexWorkingFox].y - player.y), (foxes[indexWorkingFox].x - player.x));
    var dist1 = Math.sqrt(Math.pow((foxes[indexWorkingFox].y - player.y),2)+ Math.pow((foxes[indexWorkingFox].x - player.x),2));
    if (player.finished)
    {
        deg1 = Math.atan2((settings.startPositions.y - player.y), (settings.startPositions.x - player.x));
        dist1 = Math.sqrt(Math.pow((settings.startPositions.y - player.y),2)+ Math.pow((settings.startPositions.x - player.x),2));
        if (dist1<settings.startPositions.r)
            player.winner = true;
    }
        
    
   
    if (deg1<0)
            deg1+=2*Math.PI;
    */
    var deg2 = Math.atan2(target.y1, target.x1);
    if (deg2<0)
            deg2+=2*Math.PI;
    var slowDown = 2;    
    var AlphaChannel = 0.02;
/*
    var deltaA = Math.abs(deg1 - deg2);
    var deltaInvA =Math.abs(Math.PI - deltaA);
    

    var minAngl = settings.minAn;
    
    if (dist1<200)
        minAngl = 1;
        

    if (deltaA<settings.minAn)
        AlphaChannel = (minAngl-deltaA)/minAngl;
    if (deltaA > 2*Math.PI-minAngl)
        AlphaChannel =(minAngl-(2*Math.PI-deltaA))/minAngl;
    if (deltaInvA<minAngl)
        AlphaChannel = (minAngl-deltaInvA)/(minAngl+2); 


    var deltaY = player.speed * Math.sin(deg)/ slowDown;
    var deltaX = player.speed * Math.cos(deg)/ slowDown;

    if (dist < (50 + player.radius)) {
        deltaY *= dist / (50 + player.radius);
        deltaX *= dist / (50 + player.radius);
    }
    */

    var step = (target.shift)?3:1;   
    var dX=0 ,dY= 0;    
    if (target.x>0)    
        dX = player.speed*step;        
    if (target.x<0)    
        dX = -player.speed*step;        
    if (target.y>0)    
        dY = player.speed*step;        
    if (target.y<0)    
        dY = -player.speed*step;        
    
    if (!isNaN(dY)) {
       newPlayer.y =  player.y + dY;
    }
    if (!isNaN(dX)) {        
        newPlayer.x =  player.x + dX;
    }
    
    var borderCalc = player.radius / 3;
    if (player.x > settings.gameWidth - borderCalc) {
        newPlayer.x = settings.gameWidth - borderCalc;
    }
    if (player.y > settings.gameHeight - borderCalc) {
        newPlayer.y = settings.gameHeight - borderCalc;
    }
    if (player.x < borderCalc) {
        newPlayer.x = borderCalc;
    }
    if (player.y < borderCalc) {
        newPlayer.y = borderCalc;
    }
 
   // if (player.x==newPlayer.x && player.y==newPlayer.y)
   //     return false;
   // if ((!util.collision(trees,newPlayer,1.02,prCol))||(player.godMode))
    {        
        player.x = newPlayer.x;
        player.y = newPlayer.y;
        player.direct = deg2;
        player.alfa = AlphaChannel;
        player.nearZone = false;// (dist1<500);
    }   
    return true;
}

function tickPlayer(currentPlayer) {

   
    
    let ch = movePlayer(currentPlayer);

    /*
    var ffox = findFoxes(currentPlayer);    
    if ( ffox!=-1 )
    {
          sockets[currentPlayer.id].emit('serverSendPlayerChatLocal', { sender: currentPlayer.name, message: "Я нашел лису ("+(ffox+1)+")" });     
        if (testWIN(currentPlayer))
        {            
            sockets[currentPlayer.id].emit('serverSendPlayerChatLocal', { sender: currentPlayer.name, message: "УРА! Я нашел всех лис!" });     
            currentPlayer.finished = true;
        }            
    }
       
    
    if (currentPlayer.winner)
    {
        currentPlayer.timeTotal = Math.floor((new Date().getTime() - currentPlayer.startTime)/1000);
        sockets[currentPlayer.id].emit('serverSendPlayerChatLocal', { sender: currentPlayer.name, message: "Я на финише! Мое время: "+currentPlayer.timeTotal+" секунд"});    
        currentPlayer.winner = false; 
        currentPlayer.finished = false; 
        sockets[currentPlayer.id].emit('WIN');
    }
      */  
    return ch;
    
}

function moveloop(){
    var cntPlayer=0;    
    playersInfo.length=0;
    for (var sess in players)
    {    
        if (players[sess].started)
        {

            if(players[sess].lastHeartbeat < new Date().getTime() - settings.maxHeartbeatInterval) {
      
            sockets[sess].emit('kick', 
            'Сеанс прерван после  ' + Math.floor(settings.maxHeartbeatInterval/1000) + ' секунд отсутствия активности.');
                disconnectSock(sess);
                continue;
            }
    
            var ch = tickPlayer(players[sess]);
       
            if (ch)
            {
                let t_playersInfo={
                    id: sess,                                        
                    x:players[sess].x,
                    y:players[sess].y,
                    direct:players[sess].direct,
                    alfa:players[sess].alfa,
                    nearZone:players[sess].nearZone,
                };
                playersInfo.push(t_playersInfo);    
                //console.log("Move Players "+players[sess].name);         
            }                    
          cntPlayer++;  
        }
    }        
}

function gameloop(){
    
}

function sendUpdates(){
    if (playersInfo.length>0){
        for (var sess in players)
            if (players[sess].started){

                sockets[sess].emit("moveInfo",playersInfo);
            
            // console.log("Send to "+sess+" == > "+sockets[sess]);
            // for (var vv in players[sess])
            // console.log(vv+"  =  "+players[sess][vv]);
        }
    }
}



http.listen(PORT, () => {
    console.log('Сервер слушает порт '+PORT);


});