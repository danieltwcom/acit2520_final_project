$(document).ready(function(){
    var reply_div = document.getElementById("reply_div");
    var replyBtn = document.getElementById("replyBtn");
    var replyMsg = document.getElementById("replyMsg");
    var reply_display = document.getElementById("reply_display");
    var chat_status = document.getElementById("chat_status");
    var chatroomBtn = document.getElementById("chatroomBtn");
    var chat_room = document.getElementById("chat_room");
    var online_users  = document.getElementById("online_users");
    var sendBtn = document.getElementById("send");

    
    var chat_open = false;
    chatroomBtn.addEventListener("click",function(){
        if(chat_open){
            chat_room.style.display = "none";
            chat_open = false;
        }else{
            chat_room.style.display = "block";
            chat_open = true;
        }
        
    });
    
    replyBtn.addEventListener("click",function(){
        $.ajax({
            url:"/reply",
            type:"post",
            data:{
                reply:replyMsg.value,
                type:"create"
            },
            success:function(resp){
                console.log(resp);
                location.reload();
            }
        });
    });
    
    $.ajax({
        url:"/room/roomId",
        type:"post",
        success:function(resp){
            document.getElementById("status").innerHTML = "You are in post: "+resp.roomName;
            chat_status.innerHTML = "Chatroom #" +resp.roomId+": "+resp.roomName;
            topic_title.innerHTML = "<h4>"+resp.roomName+"</h4>";
            topic_desp.innerHTML = resp.roomDesp;
            
            initSockets(resp.roomId,resp.username);
            console.log(resp);
            
            for(var i=0;i<resp.result.length;i++){
                var reply = resp.result[i].reply;
                var upvote_num = resp.result[i].upvote_num;
                var reply_id = resp.result[i].id;
                var time  = resp.result[i].time_created.replace(/T/, ' ').replace(/\..+/, '');
                
                var ndiv = document.createElement("div");
                ndiv.innerHTML += "<div id='reply'>"+"<div id='reply_msg'>"+reply+"</div>"+"<div id=reply_time>"+time+"</div>"+"</div>";
                ndiv.id = "replies";
                reply_display.appendChild(ndiv);
                
                
                var upvote = document.createElement("button");
                upvote.id = "upvote";
                console.log(upvote_num);
                upvote.innerHTML = "+" + upvote_num;
                upvote.myid = reply_id;
                upvote.mynum = upvote_num;
                
                ndiv.appendChild(upvote);
                
                upvote.addEventListener("click",function(){
                    $.ajax({
                        url:"/upvote",
                        type:"post",
                        data:{
                            replyId:this.myid
                        },
                        success:function(){
                            location.reload();
                        }
                    });
                })
            }
        }
    });
})

function initSockets(roomId,username){
    var socket = io();
    
    socket.emit("join room",roomId);
    /*socket.emit("new user",username);*/
    
    // send msg
    document.getElementById("send").addEventListener("click",function(){
        var obj = {
            msg: document.getElementById("msg").value,
            username:username,
            roomId:roomId
        };
        socket.emit("send message",obj);
        document.getElementById("msg").value = "";
    });
    
    document.getElementById("msg").addEventListener("keypress",function(e){
        var key = e.which || e.keyCode;
        if (key === 13) {
            var obj = {
            msg: document.getElementById("msg").value,
            username:username,
            roomId:roomId
            };
            socket.emit("send message",obj);
            document.getElementById("msg").value = "";
        }
    });
    
    // get msg and create
    socket.on("create message", function(obj){
        console.log(obj);
        var ndiv = document.createElement("div");
        ndiv.id = "msg_div";
        ndiv.innerHTML = "<div id='username'>"+obj.username+"</div>"+": "+obj.msg;
        
        document.getElementById("display").appendChild(ndiv);
    })
}