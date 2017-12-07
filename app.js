var express = require("express");
http = require('http');
var app = express();
var express = require('express')
var morgan = require('morgan');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.set('passport', require('./models/authentication.js').init(app));

require('./routes/users.js').init(app);
require('./routes/hands.js').init(app);


 
app.use(morgan('tiny'));

// Set the views directory
app.set('views', __dirname + '/views');

// Define the view (templating) engine
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

/*var sio =require('socket.io');
var io = sio(app);
app.listen(50000);
console.log("Server listening at http://localhost:50000/");*/

var httpServer = http.Server(app);
/*2*/ var sio =require('socket.io');
/*3*/ var io = sio(httpServer);
/*4*/ httpServer.listen(50000, function() {console.log('Listening on 50000');});

var gameSockets = require('./routes/serverSockets.js');
gameSockets.init(io);