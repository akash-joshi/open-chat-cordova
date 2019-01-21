$(() => {

  let prev;
  let ready = false;
  let room;
  let thisme
  let pause=false
  const cleanInput = input => $('<div/>').text(input).html();
  const socket = io("https://open-chat.now.sh");

  const onDeviceReady = () => {
    console.log(cordova.plugins.notification);
  }

  const onPause = () => {
    pause = true
  }

  const onResume = () => {
    pause = false
  }


  document.addEventListener("deviceready", onDeviceReady, false);
  document.addEventListener("pause", onPause, false);
  document.addEventListener("resume", onResume, false);
  
  $('#login').show();
  $("#login").submit((event) => {
    event.preventDefault();
  });

  $('#usersubmit').click(() => {
    const nick = cleanInput($('#user').val().trim());  
    room = $('#room').val()
    if(nick){
      thisme = nick;
      socket.emit("join", nick,room);
      ready = true;
      $(".mainwrapper").css('display','flex');
      $('#login').hide();
      cordova.plugins.notification.local.requestPermission();
    }
  });

  $("#sendform").submit( () => {
    const message = cleanInput($('#m').val());
    
    if(message){
      socket.emit('chat message', $('#m').val(),room);
      $('#m').val('');
    }
    
    return false;
  });
  

  socket.on("add-person", (nick,id) => {
    console.log(nick)
    if(ready){
      $('#online').append('<li id="' + id + '">' + nick);
    }
      
    })  

  socket.on("remove-person", (nick) => {
    console.log(nick);
    $('#'+nick).remove();
  });

  socket.on("update", (msg) => {
    $('#messages').append('<li id="update" >' + msg);
    prev='';
  })

  socket.on("people-list", (people) => {
    for (person in people) {
        $('#online').append('<li id="' + people[person].id + '">' + people[person].nick);
    }
  });

  socket.on("disconnect", () => {
    $('#messages').append("<li id=\"update\">You have lost connection to server, check your internet or try to refresh the page");
    $('#sendform').hide();
  });
  socket.on("reconnect", ()=>{
    location.reload()
  })
  socket.on('chat message', (nick, msg) => {

    if (prev == nick) {
      $('#messages li:last-child > div').append("<div>" + msg + "</div>");
    } else {
      $('#messages').append("<li> <strong>" + nick + "</strong> : " + "<div id=\"innermsg\">" + msg + "</div></li>")
    }

    if(thisme != nick )
      cordova.plugins.notification.local.schedule({
        title: nick,
        text: msg,
        foreground: true
      });

    prev = nick;
    $("#messages").animate({
      scrollTop: $('#messages').prop("scrollHeight")
    }, 100);
  });

  socket.on('message que', (nick, msg) => {
    if (prev == nick) {
      $('#messages li:last-child > div').append("<div>" + msg + "</div>");
    } else {
      $('#messages').append("<li> <strong>" + nick + "</strong> : " + "<div id=\"innermsg\">" + msg + "</div></li>");
    }

    prev = nick;
  });
});