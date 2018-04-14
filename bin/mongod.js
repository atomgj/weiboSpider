var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017/";

var dbFactory = {};

dbFactory.timestamp = {};
dbFactory.saveInDB = function(param, callback) {
    mongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("weibo");
        var collection = dbo.collection("财上海");

        collection.insertOne(param, callback, function (err, res) {
            if (err) throw err;
            if (callback) {
                callback();
            }
            console.log(param.date);
            db.close();
        });
    });
};

dbFactory.findAll = function(){
    mongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("weibo");
        var collection = dbo.collection("财上海");

        collection.find().toArray(function (err, docs) {
            var i;
            for(i = 0;i<docs.length; i++){
                dbFactory.timestamp[docs[i].date] = docs[i].date;
            }
            db.close();
        });
    });
};

dbFactory.findAll();

module.exports = dbFactory;
