//set everything up
const express = require("express");
const port = process.env.PORT || 10000;
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const pg  = require("pg");
var pF = path.resolve(__dirname,"public");
var app = express();

//create a new server for socket, but combine it with express functions
const server = require("http").createServer(app);

//create a socket server with the new server
var io = require("socket.io")(server);

//postgres
//database url
var dbURL = "postgres://postgres:1994Daniel@localhost:5432/forum_project";


//use body parser
app.use(bodyParser.urlencoded({
    extended:true
}));

//use sessions
app.use(session({
    secret:"ddd83",
    resave:true,
    saveUninitialized:true
}));

app.use("/scripts",express.static("build"));

app.use("/css",express.static("css"));

app.use("/images",express.static("images"));

//root folder
app.get("/", function(req, resp){
    if(req.session.userID){
       resp.sendFile(pF+"/post.html");
   } else{
       resp.sendFile(pF+"/main.html");
   }
});

app.get("/room/:roomindex/:roomName/:roomDesp",function(req,resp){
    if(req.session.userID){
        var index = req.params.roomindex;
        var roomName = req.params.roomName;
        var roomDesp = req.params.roomDesp;
        req.session.roomId = index;
        req.session.roomName = roomName;
        req.session.roomDesp = roomDesp;
        resp.sendFile(pF+"/room.html");
    }else{
        resp.sendFile(pF+"/main.html");
    }
    
});

app.post("/upvote",function(req,resp){
    pg.connect(dbURL,function(err,client,done){
        if(err){
           console.log(err);
           return false;
        }
        client.query("UPDATE replies SET upvote_num=upvote_num+1 WHERE id=$1", [req.body.replyId], function(err,result){
            done();
            if(err){
                console.log(err);
                return false;
            }
            resp.send({
                status:"success"
            });
        });
    });
});

app.post("/room/roomId",function(req,resp){
    pg.connect(dbURL,function(err,client,done){
        if(err){
           console.log(err);
           return false;
        }
        client.query("SELECT * FROM replies WHERE post_id = $1 ORDER BY upvote_num DESC", [req.session.roomId], function(err,result){
            done();
            if(err){
                console.log(err);
                return false;
            }
            var obj = {
                roomId: req.session.roomId,
                roomName: req.session.roomName,
                username:req.session.userName,
                roomDesp:req.session.roomDesp,
                result:result.rows
            }
            resp.send(obj);
        });
    });
});

app.post("/reply",function(req,resp){
    if(req.body.type == "create"){
       pg.connect(dbURL,function(err,client,done){
           if(err){
               console.log(err);
               return false;
           }
            client.query("INSERT INTO replies (post_id,reply) VALUES ($1,$2)", [req.session.roomId,req.body.reply], function(err,result){
                done();
                if(err){
                    console.log(err);
                    return false;
                }
                resp.send({
                    status:"success"
                });
            });
        });
    }
});

app.post("/accountAction",function(req,resp){
    // check input
    var validInput = checkInput(req);
    if(!validInput){
        resp.send({
            status:"invalid input"
        });
    }else{
    // handle reg action
        if(req.body.type == "reg"){
           pg.connect(dbURL,function(err,client,done){
               if(err){
                   console.log(err);
                   return false;
               }
                client.query("SELECT * FROM users WHERE username=$1 or email =$2", [req.body.username,req.body.email], function(err,result){
                    done();
                    if(err){
                        console.log(err);
                        return false;
                    }
                    if(result.rows.length>0){
                        resp.send({
                            status:"exist user"
                        })
                    }else{
                        pg.connect(dbURL,function(err,client,done){
                           if(err){
                               console.log(err);
                               return false;
                           }
                            client.query("INSERT INTO users (username,password,email) VALUES ($1,$2,$3)", [req.body.username,req.body.password,req.body.email], function(err,result){
                                done();
                                if(err){
                                    console.log(err);
                                    return false;
                                }
                                resp.send({
                                    status:"success"
                                });
                            });
                        });
                    }

                });
            });

        }
        // handle login action
        if(req.body.type == "login"){
            pg.connect(dbURL,function(err,client,done){
               if(err){
                   console.log(err);
                   return false;
               }
                client.query("SELECT * FROM users WHERE email = $1 and password = $2", [req.body.email,req.body.password], function(err,result){
                    done();
                    if(err){
                        console.log(err);
                        return false;
                    }

                    if(result.rows.length>0){
                        req.session.userID = result.rows[0].id;
                        req.session.userName = result.rows[0].username;
                        var obj = {
                            username:result.rows[0].username,
                            status:"success"
                        }
                        resp.send(obj);
                    }else{

                        resp.send({
                            status:"fail"
                        });

                    }
                });
            });
        }
    }
    
});

app.post("/postAction", function(req,resp){
    if(req.body.type == "create"){
        pg.connect(dbURL,function(err,client,done){
           if(err){
               console.log(err);
               return false;
           }
            client.query("INSERT INTO posts (user_id,title,description) VALUES ($1,$2,$3)", [req.session.userID,req.body.room,req.body.desp], function(err,result){
                done();
                if(err){
                    console.log(err);
                    return false;
                }
                resp.send({
                    status:"success"
                });
            });
        });
    } 
    
    if(req.body.type == "read"){
        pg.connect(dbURL,function(err,client,done){
           if(err){
               console.log(err);
               return false;
           }
            client.query("SELECT * FROM posts", [], function(err,result){
                done();
                if(err){
                    console.log(err);
                    return false;
                }
                resp.send({
                    result:result.rows,
                    username:req.session.userName
                });
            });
        });
    } 
    
    if(req.body.type == "logout"){
        req.session.destroy();
        resp.send("success");
    }
});

var users = {};

io.on("connection",function(socket){
    socket.on("new user",function(username){
        if(username in users){
        }else{
            socket.join("public room");
            socket.nickname = username;
            users[socket.nickname] = socket;
            updateNicknames();
        }
       
    });
    function updateNicknames(){
        io.to("public room").emit("usernames",Object.keys(users))
    }
    socket.on("join room",function(roomId){
        socket.roomId = "room" + roomId;
        socket.join(socket.roomId);
    });
    socket.on("send message", function(obj){
        io.to(socket.roomId).emit("create message", obj); 
    });
    
    socket.on("private message",function(obj){
        var msg = obj.msg.trim();
        if(msg.substr(0,3) === "/w "){
            msg = msg.substr(3);
            var index = msg.indexOf(" ");
            if(index != -1){
                var name = msg.substring(0,index);
                var msg = msg.substring(index +1);
                if(name in users){
                    socket.emit("create message", {msg: msg, nickname:socket.nickname});
                    users[name].emit("create message", {msg: msg, nickname:socket.nickname});
                }else{
                    //callback("User not found");
                }
            }else{
                //callback("plase enter a msg")
            }
        }
    });
    socket.on("disconnect",function(){
        if(!socket.nickname) return;
        delete users[socket.nickname];
        updateNicknames();
    });
});

function checkInput(req){
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var regEx = /^[a-zA-Z0-9]{4,20}/;
    var regEx2 = /^[0-9a-zA-Z\.\_\-]{3,20}@[a-zA-Z0-9\-]{3,20}\.(com|info|ca|org)$/;
    var valid_username = regEx.test(username);
    var valid_email = regEx2.test(email);
    var valid_password = regEx.test(password);
    console.log(valid_email,valid_password,valid_username)
    
    if(valid_email && valid_password && valid_username){
        return true;
    }else{
        return false;
    }
}

// server listen
server.listen(port, function(err){
    if(err){
        console.log(err);
        return false;
    }
    
    console.log(port+" is running");
});