$(document).ready(function(){
    var email = document.getElementById("email");
    var username = document.getElementById("username");
    var password = document.getElementById("password");
    var logBtn = document.getElementById("loginBtn");
    var regBtn = document.getElementById("regBtn");
    var submitBtn = document.getElementById("submitBtn");
    
    var action = "login";
    
    logBtn.style.color = "green";
    logBtn.addEventListener("click",function(){
        username.style.display = "none";
        logBtn.style.color = "green";
        regBtn.style.color = "";
        action = "login";
    });
    
    regBtn.addEventListener("click",function(){
        username.style.display = "block";
        regBtn.style.color = "green";
        logBtn.style.color = "";
        action = "reg";
    });
    
    submitBtn.addEventListener("click",function(){
        if(action == "login"){
            $.ajax({
                url:"/accountAction",
                type:"post",
                data:{
                    type:"login",
                    email:email.value,
                    password:password.value
                },
                success:function(resp){
                    if(resp.status=="invalid input"){
                        alert("Invalid Email or Password.");
                    }
                    location.href="/";
                }
            });
        }
        if(action == "reg"){
            $.ajax({
                url:"/accountAction",
                type:"post",
                data:{
                    type:"reg",
                    email:email.value,
                    username:username.value,
                    password:password.value
                },
                success:function(resp){
                    if(resp.status == "success"){
                        alert("register sucessfully");
                    }else if(resp.status=="invalid input"){
                        alert("invalid username,password or email. Please enter 4-20 chracters for username and password");
                    }else if(resp.status == "exist user"){
                        alert("the username or email already exist");
                    }else{
                        alert("register fail");
                    }
                    location.href="/";
                    
                }
            });
        }
    });
});;