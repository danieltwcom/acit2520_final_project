$(document).ready(function(){
    var logoutBtn = document.getElementById("logoutBtn");
    var chat_status = document.getElementById("chat_status");
    var privateChatRoom = document.getElementById("privateChatRoom");
    var online_users  = document.getElementById("online_users");
    var privateChatBtn = document.getElementById("privateChatBtn");
    var sendBtn = document.getElementById("send");
    
    
    var chat_open = false;
    
    chat_status.innerHTML="<b>Pivate Message Channel</b>";
    
    
    
    
    privateChatBtn.addEventListener("click",function(){
        if(chat_open){
            privateChatRoom.style.display = "none";
            chat_open = false;
        }else{
            privateChatRoom.style.display = "block";
            chat_open = true;
        }
        
    });
    
    $.ajax({
        url:"/postAction",
        type:"post",
        data:{
          type:"read"  
        },
        success:function(resp){
            console.log(resp);
            for(var i=0;i<resp.result.length;i++){
                var title = resp.result[i].title;
                var desp = resp.result[i].description;
                var id = resp.result[i].id;
                var time  = resp.result[i].time_created;
                
                var ndiv = document.createElement("div");
                ndiv.innerHTML += "<div id='title'>"+"<h3 id='post_title'>"+title+"</h3>"+"<p id='post_desp'>"+desp+"</p>"+"</div>";
                ndiv.className = "post_div";
                    
                document.body.appendChild(ndiv);
                    
                ndiv.myindex = id;
                ndiv.myName = title;
                ndiv.mydesp = desp;
                ndiv.addEventListener("click",function(){
                    location.href = "/room/"+this.myindex+"/"+this.myName+"/"+this.mydesp;
                });
            }
            initSockets(resp.username);
        }
    });
    
    logoutBtn.addEventListener("click",function(){
        $.ajax({
            url:"/postAction",
            type:"post",
            data:{
                type:"logout"
            },
            success:function(resp){
                location.href="/";
            }
        });
    });
    
    document.getElementById("create").addEventListener("click", function(){
        var room = document.getElementById("room").value;
        var desp = document.getElementById("desp").value;
        $.ajax({
            url:"/postAction",
            type:"post",
            data:{
                room: room,
                desp: desp,
                type:"create"
            },
            success:function(resp){
                console.log(resp);
                
                if(resp.status == "success"){
                    location.href="/";
                }
            }
        })
    });
    
});

function initSockets(username){
    var socket = io();
    
    socket.emit("new user",username);
    
    // send msg
    document.getElementById("send").addEventListener("click",function(){
        var obj = {
            msg: document.getElementById("msg").value,
            username:username,
        };
        socket.emit("private message",obj);
        setTextInput();
    });
    
    document.getElementById("msg").addEventListener("keypress",function(e){
        var key = e.which || e.keyCode;
        if (key === 13) { 
            var obj = {
                msg: document.getElementById("msg").value,
                username:username,
            };
            socket.emit("private message",obj);
            setTextInput();
        }
    });
    
    function setTextInput(){
        var msg_input = document.getElementById("msg");
        var msg = msg_input.value.trim();
        var sub_msg = msg.substr(3);
        var index = sub_msg.indexOf(" ");
        console.log(msg.substr(0,index+3));
        msg_input.value = msg.substr(0,index+4);
    }
    
    
    // get online usernames
    socket.on("usernames",function(data){
        online_users.innerHTML ="<p><b>ONLINE USERS: </b></p>";
        for (i=0;i<data.length;i++){
            online_users.innerHTML += data[i]+"<br />";
        }
    });
    
    // get msg and create
    socket.on("create message", function(obj){
        console.log(obj);
        var ndiv = document.createElement("div");
        ndiv.className = "username";
        ndiv.innerHTML = obj.nickname+": "+obj.msg;
        
        document.getElementById("display").appendChild(ndiv);
        var display = document.getElementById("display");
        // auto scrolll to bottom
        display.scrollTop = display.scrollHeight;
        
    })
}