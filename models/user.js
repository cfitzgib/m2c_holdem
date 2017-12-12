var mongoClient = require('mongodb').MongoClient;



var connection_string = "mongodb://cfitzgib:ltp0wnsu21@ds163705.mlab.com:63705/cfitzgib_project";

mongoDB = 0;

mongoClient.connect(connection_string, function(err, db){
	if (err) doError(err);
	console.log("Connected to Mongo server");
	mongoDB = db;
});

var user_class = class User{
	constructor(username, password){
		this.username = username;
		this.password = password.hashCode();
		this.net_winnings = 0;
		this.hand_wins = 0;
		this.hand_losses = 0;
	}
}

	exports.user = user_class;

	exports.create_user = function(params, callback){
		var use = new user_class(params.username, params.password);
		mongoDB.collection('user').insertOne(
	    use,                     // the object to be inserted
	    function(err, status) {   
	      if (err) doError(err);
	      
	      callback(use);
	    });
	}

	exports.read_user = function(params, callback){
		var query = {"username": params};
		mongoDB.collection("user").find(query).toArray(function(err, result) {
		    if (err) doError(err);
		    callback(result);
		  });
	}

	exports.find_by_username = function(username, callback){
		var query = {"username": username};
		mongoDB.collection("user").find(query).toArray(function(err, result) {
		    callback(err, result);
		  });
	}

	exports.update_user = function(username, chips, callback){
		console.log(chips);
		mongoDB.collection("user").updateMany(
			{ "username" : username},
			{ $set: {"net_winnings" : chips}},
			function(err, result){
				if(err) doError(err);
				callback(result);
			}
		);
	}

	exports.delete_user = function(username, callback){
		var query = {"username": username};
		mongoDB.collection("user").remove(query, function(err, result){
			if(err) doError(err);
			callback(result);
		});
	}

	

	exports.login = function(params, callback){
		var query = {"username": params.username, "password": params.password.hashCode()};
		console.log(query);
		mongoDB.collection("user").find(query).toArray(function(err, result) {
		    if (err) doError(err);
		    console.log(result);
		    if(result.length == 0) callback(false);
		    else callback(true);
		  });
	}

var doError = function(e) {
        console.error("ERROR: " + e);
        throw new Error(e);
    }


String.prototype.hashCode = function() {
    var hash = 0;
    if (this.length == 0) {
        return hash;
    }
    for (var i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}