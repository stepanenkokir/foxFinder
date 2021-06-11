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

var foxes=[];
var trees = [];

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
        console.log("Auth = "+nName);
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
        
        if (!players[sessID].started)
        {
            players[sessID].startTime=Date.now();
            players[sessID].currentFox = 0; 
            players[sessID].findFox=[]; 
            for (var indx=0;indx<foxes.length;indx++)
                players[sessID].findFox.push(0); 

            players[sessID].finished=false;
            players[sessID].winner = false;
        }
        players[sessID].started = true;
        sockets[sessID] = socket;
        players[sessID].lastHeartbeat = new Date().getTime();
        players[sessID].id = sessID;
        //players[sessID].target={x:0,y:0,x1:0,y1:0, shift:false};
        players[sessID].target={st:0,dir:0,shift:false};
        players[sessID].x=position.x;
        players[sessID].y=position.y;
        players[sessID].radius = 10;
        players[sessID].speed = 1;
        players[sessID].step = 0;        
        players[sessID].st = 0;  
        players[sessID].foxInfo = {} ;

        

        console.log("Start game for "+ players[sessID].name +" from "+sessID);        

        socket.emit('gameSetup', {
                gameWidth: settings.gameWidth,
                gameHeight: settings.gameHeight,
                positions: position,
                id:sessID,
                numFox: settings.maxFoxes,
            });     
    });

    socket.on('dscnct', function(){                
        disconnectSock(socket.request.session.id);
    });
    

    socket.on('windowResized', function (data) {
        sessID = socket.request.session.id;
       // console.log("Window resize!!");
        players[sessID].screenWidth = data.screenWidth;
        players[sessID].screenHeight = data.screenHeight;
    });

   // Heartbeat function, update everytime.
    socket.on('0', function(target) {
        sessID = socket.request.session.id;
        if (sessID in players)
        {      
            players[sessID].lastHeartbeat = new Date().getTime();         
            players[sessID].target = target;        
        }        
    });
});

function disconnectSock(sID){
    
    delete players[sID];
    delete sockets[sID];
    console.log("DISCONNECTED game for "+sID);      
}

setInterval(moveloop, 1000 / 60);
setInterval(gameloop, 1000/10);
setInterval(sendUpdates, 1000 / settings.networkUpdateFactor);


function addFox(toAdd) {
    var radius = {x:15, y:15};
    while (toAdd--) {        
        var position = util.randomPositionNonCollision(trees,foxes,radius,2);   
          //    position.x=100+toAdd*200;             
          //    position.y=100+toAdd*200;             
        foxes.push({
            // Make IDs unique.
            id: foxes.length,
            x: position.x,
            y: position.y,
            radius: 15,            
            hue: (foxes.length*360/settings.maxFoxes)
        });
        console.log("Fox "+foxes.length +" Pos = "+position.x+":"+position.y);
    }   
}

function addTrees(toAdd) {
    //start Positions
    trees.push({
            id: -1,
            x: settings.startPositions.x,
            y: settings.startPositions.y,
            radiusX: settings.startPositions.r,
            radiusY: settings.startPositions.r,           
            fill: 0,
            stroke:  1,
            strokeWidth: 2
        }); 
        
    while (toAdd--) {                                 
        var radius = util.randomRadius(settings.minRadius, settings.maxRadius);        
        var position = util.randomPositionNonColl(trees,radius,1.1); 
        trees.push({
            id: trees.length,
            x: position.x,
            y: position.y,
            radiusX: radius.x,
            radiusY: radius.y,           
            fill: Math.round(Math.random() * 360),
            stroke:  Math.round(Math.random() * 360),
            strokeWidth: Math.round(Math.random() * 10)
        });
    }    
    console.log("Add Trees = "+trees.length);   
    
}

function testWIN(player)
{ 
    for (var i=0;i<foxes.length;i++)
        if (player.findFox[i]===0)
            return false;    
    return true;
}

function findFoxes(player)
{
    for (var i=0;i<foxes.length;i++)
    { 
        var RES = Math.sqrt(Math.pow((player.x - foxes[i].x),2) + Math.pow((player.y - foxes[i].y),2));        
        
          if ((RES<((i==player.currentFox)?60:15))&&(player.findFox[i]===0))
        {            
            player.findFox[i]=  (new Date().getTime() - player.startTime)/1000;            
            return i;                
        }        
    }
    return -1;
}

function movePlayer(player) {

    var x =0,y =0;
    var prCol = false;
    var target = {
        st: player.target.st,
        dir: player.target.direct,          
        shift: player.target.shift, 
    };   
    
    var newPlayer = {x:0, y:0}; 
    var slowDown = 2;    
    var step = (target.shift)?2:1;   
    var dX=0 ,dY= 0;    
   
    if (target.st>0)
    {   
        dY = player.speed*step*((target.st-1)%4>0?1:0)*Math.pow(-1,(1-Math.floor((target.st-1)/4)));
        dX = player.speed*step*((target.st+1)%4>0?1:0)*Math.pow(-1,(1-Math.floor((target.st+1)/4)));
    }
    
    if (dX!=0 || dY!=0)
    {
        dX+=Math.cos(target.dir)/slowDown;
        dY+=Math.sin(target.dir)/slowDown;  
        player.step+=1;  
        if (player.step>=1000)
            player.step=0;
    }
    else
        player.step=0;  


    let preAlf = 90+(target.dir/Math.PI*180);
    if (preAlf<247.5)preAlf+=360;
    player.st = Math.floor((preAlf-247.5)/45);   
    
    newPlayer.x =  player.x + dX;
    newPlayer.y =  player.y + dY;

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

    var degToFox = Math.atan2((foxes[player.currentFox].y - player.y), (foxes[player.currentFox].x - player.x));    
    var distToFox = Math.sqrt(Math.pow((foxes[player.currentFox].y - player.y),2)+ Math.pow((foxes[player.currentFox].x - player.x),2));
    if (player.finished)
    {
        degToFox = Math.atan2((settings.startPositions.y - player.y), (settings.startPositions.x - player.x));
        distToFox = Math.sqrt(Math.pow((settings.startPositions.y - player.y),2)+ Math.pow((settings.startPositions.x - player.x),2));
        if (distToFox<settings.startPositions.r)
            player.winner = true;
    }

    if (degToFox<0)degToFox+=2*Math.PI;
    var AlphaChannel = 0.02;
    var deltaA = Math.abs(degToFox - target.dir);
    var deltaInvA =Math.abs(Math.PI - deltaA);
    

    var minAngl = settings.minAn;   
    if (distToFox<200)
        minAngl = 1;
        
    if (deltaA<settings.minAn)
        AlphaChannel = (minAngl-deltaA)/minAngl;
    if (deltaA > 2*Math.PI-minAngl)
        AlphaChannel =(minAngl-(2*Math.PI-deltaA))/minAngl;
    if (deltaInvA<minAngl)
        AlphaChannel = (minAngl-deltaInvA)/(minAngl+2); 

   
  // console.log("User dg = "+target.dir*180/Math.PI+ "  toFox = "+degToFox*180/Math.PI+ " delta = "+deltaA + " Alfa = "+AlphaChannel);


        //testWin


    if ((!util.collision(trees,newPlayer,1.02,prCol))||(player.godMode))
    {        
        player.x = newPlayer.x;
        player.y = newPlayer.y;       
        player.foxInfo={angl:degToFox, dist:distToFox};
        player.alfa = AlphaChannel;
        player.nearZone = distToFox<500;
    }       
    return true;
}

function tickPlayer(currentPlayer) {

   
    
    let ch = movePlayer(currentPlayer);

    var ffox = findFoxes(currentPlayer);    
    if ( ffox!=-1 )
    {
        
        sockets[currentPlayer.id].emit('findFox', { indx:ffox});     
        if (testWIN(currentPlayer))
        {            
            sockets[currentPlayer.id].emit('findFox', {indx:999});     
            currentPlayer.finished = true;
        } 
                
    }    
    
    if (currentPlayer.winner)
    {
        let timeTotal = Math.floor((new Date().getTime() - currentPlayer.startTime)/1000);
//        sockets[currentPlayer.id].emit('serverSendPlayerChatLocal', { sender: currentPlayer.name, message: "Я на финише! Мое время: "+currentPlayer.timeTotal+" секунд"});    
        currentPlayer.winner = false; 
        currentPlayer.finished = false; 
        console.log("WINNER");

        sockets[currentPlayer.id].emit('WIN',{time:timeTotal});
        sockets[currentPlayer.id].emit('kick', 
            '"ПОБЕДА! Этот этап пройден!');
        disconnectSock(currentPlayer.id);
        return false;
    } 

    return true;             
}

function moveloop(){    
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
                    frame:{f1:players[sess].st, f2:players[sess].step},                    
                    alfa:players[sess].alfa,
                    nearZone:players[sess].nearZone,
                    foxInfo:players[sess].foxInfo,
                };
                playersInfo.push(t_playersInfo);    
             //  console.log("Move Players  st = "+t_playersInfo.frame.f1+":"+t_playersInfo.frame.f2);                                               
            }
        }
    }        
}

function gameloop(){

    let nowTime = new Date().getTime();
    for (var sess in players)
    {
         if (players[sess].started)
        { 
            let dTime=(nowTime - players[sess].startTime)/1000;
            let indFox=Math.floor((dTime/ settings.lengthOfCycleFox)%settings.maxFoxes); 
            players[sess].currentFox= indFox;

            let indTimer=1-(dTime % settings.lengthOfCycleFox)/settings.lengthOfCycleFox; 
            sockets[sess].emit("foxInfo",{id:indFox, clr: settings.colorFoxes[indFox], time:indTimer, timeInGame:dTime}, players[sess].findFox);

          //   console.log(players[sess].id + " in game for "+ (nowTime - players[sess].startTime) + " = "+dTime+ "  == "+indTimer + " == "+indFox);
        }
    }
    
}

function sendUpdates(){
    if (playersInfo.length>0){

        for (var sess in players)
            if (players[sess].started){                
                const u = players[sess];            
                var visibleFox = foxes.map(function (f){                                                        
                    if (( f.x+f.radius > u.x - u.screenWidth/2 - 20 &&
                    f.x-f.radius < u.x + u.screenWidth/2 + 20 &&
                    f.y+f.radius > u.y  - u.screenHeight/2 - 20 &&
                    f.y-f.radius < u.y  + u.screenHeight/2 + 20)&&
                    (u.findFox[f.id]>0))
                        return f;
                }).filter(function(f) { return f; });

                var visibleTrees = trees.map(function (f){
                    if ( f.x+f.radiusX > u.x - u.screenWidth/2 - 20 &&
                    f.x-f.radiusX < u.x + u.screenWidth/2 + 20 &&
                    f.y+f.radiusY > u.y - u.screenHeight/2 - 20 &&
                    f.y-f.radiusY < u.y + u.screenHeight/2 + 20) {
                    return f;
                }
                }).filter(function(f) {return f;});
                
                sockets[sess].emit("moveInfo",playersInfo, visibleTrees, visibleFox);
                     
        }
    }
}

addFox(settings.maxFoxes);
addTrees(settings.maxTrees);

http.listen(PORT, () => {
    console.log('Сервер слушает порт '+PORT);
});