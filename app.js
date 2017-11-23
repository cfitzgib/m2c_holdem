var express = require("express");
var app = express();
var express = require('express')
var morgan = require('morgan');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


require('./routes/users.js').init(app);
require('./routes/hands.js').init(app);
 
app.use(morgan('tiny'));

app.use(express.static(__dirname + '/public'));

app.listen(50000);
console.log("Server listening at http://localhost:50000/");