var http  = require('http'),
url   = require('url'),
spawn = require('child_process').spawn,
ws    = require('./ws.js');

var availableComands = ['ls', 'ps', 'uptime', 'tail', 'cat'];

ws.createServer(function(websocket) {
    console.log('createServer');
    websocket.addListener("connect", function (resource) {
        console.log('Connect');
        var parsedUrl = url.parse(resource, true);
        var rawCmd = parsedUrl.query.cmd;
        var cmd = rawCmd.split(" ");
        if (cmd[0] == 'help') {
            websocket.write("Available comands: \n");
            for (i=0;i<availableComands.length;i++) {
                websocket.write(availableComands[i]);
                if (i< availableComands.length - 1) {
                    websocket.write(", ");
                }
            }
            websocket.write("\n");

            websocket.end();
        } else if (availableComands.indexOf(cmd[0]) >= 0) {
            if (cmd.length > 1) {
                options = cmd.slice(1);
            } else {
                options = [];
            }
            
            try {
                var process = spawn(cmd[0], options);
            } catch(err) {
                console.log(err);
                websocket.write("ERROR");
            }

            websocket.addListener("end", function (resource) {
                process.kill();
            });

            process.stdout.on('data', function(data) {
                websocket.write(data);
            });

            process.stdout.on('end', function() {
                websocket.end();
            });
        } else {
             websocket.write("Comand not available. Type help for available comands\n");
             websocket.end();
        }
    });
  
}).listen(8880, '127.0.0.1');


