var mongoClient = require('mongodb').MongoClient;

var connection_string = "mongodb://localhost:27017/dbname";

var mongoDB;

mongoClient.connect(connection_string, function(err, db){
	if (err) doError(err);
	console.log("Connec to Mongo server");
	mongoDB = db;
})

exports.create = function(collection, data, callback) {
	mongoDB.collection(collection).insertOne(
		data,
		function(err, status){
			if (err) doError(err);
			var success = (status.result.n == 1 ? true : false);
			callback(success);
		});
}
