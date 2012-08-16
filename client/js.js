var timeout = 5000;
var wsServer = '127.0.0.1:8880';

var ws;


function cleanString(string) {
    return string.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}


function pad(n) {
    return ("0" + n).slice(-2);
}

var cmdHistory = [];
function send(msg) {
    if (msg == 'clear') {
        $('#log').html('');
        return;
    }
    try {
        ws = new WebSocket('ws://' + wsServer + '?cmd=' + msg);
        $('#toolbar').css('background', '#933');
        $('#socketStatus').html("working ... [<a href='#' onClick='quit()'>X</a>]");
        cmdHistory.push(msg);
        $('#log').append("<div class='cmd'>" + msg + "</div>");
        console.log("startWs:", ws);
    } catch (err) {
        console.log(err);
        setTimeout(startWs, timeout);
    }

    ws.onmessage = function(event) {
        $('#log').append(util.toStaticHTML(event.data));
        window.scrollBy(0, 100000000000000000);
    };

    ws.onclose = function(){
        //console.log("ws.onclose");
        $('#toolbar').css('background', '#65A33F');
        $('#socketStatus').html('Type your comand:');
    }
}

function quit() {
    ws.close();
    window.scrollBy(0, 100000000000000000);
}
util = {
  urlRE: /https?:\/\/([-\w\.]+)+(:\d+)?(\/([^\s]*(\?\S+)?)?)?/g, 

  //  html sanitizer 
  toStaticHTML: function(inputHtml) {
    inputHtml = inputHtml.toString();
    return inputHtml.replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace("/n", "<br/>")
                    .replace(/>/g, "&gt;");
  }, 

  //pads n with zeros on the left,
  //digits is minimum length of output
  //zeroPad(3, 5); returns "005"
  //zeroPad(2, 500); returns "500"
  zeroPad: function (digits, n) {
    n = n.toString();
    while (n.length < digits) 
      n = '0' + n;
    return n;
  },

  //it is almost 8 o'clock PM here
  //timeString(new Date); returns "19:49"
  timeString: function (date) {
    var minutes = date.getMinutes().toString();
    var hours = date.getHours().toString();
    return this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes);
  },

  //does the argument only contain whitespace?
  isBlank: function(text) {
    var blank = /^\s*$/;
    return (text.match(blank) !== null);
  }
};
$(document).ready(function() {
  //submit new messages when the user hits enter if the message isnt blank
  $("#entry").keypress(function (e) {
    console.log(e);
    if (e.keyCode != 13 /* Return */) return;
    var msg = $("#entry").attr("value").replace("\n", "");
    if (!util.isBlank(msg)) {
        send(msg);
    }
    $("#entry").attr("value", ""); // clear the entry field.
  });
});
