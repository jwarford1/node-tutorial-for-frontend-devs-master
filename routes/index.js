var express = require('express');
var router = express.Router();
var data = require('./data.json');
var Client = require('node-rest-client').Client;
const crypto = require("crypto");
const randomInt = require('random-int');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
    res.render('helloworld', { title: 'Hello, World!' });
});

/* GET Userlist page. */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    
    collection.find({},{},function(e,docs){
        res.render('userlist', {
            "userlist" : docs
        });
    });
    
});

/* GET New User page. */
router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New Contract' });
});

/* POST to Add User Service */
router.post('/adduser', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var consumer = req.body.consumername;
    var provider = req.body.providername;
    var restmethod = req.body.restmethod;
    var restpath = req.body.restpath;
   
    var responsebody = req.body.httpExpectedResponseBody;
    var status = req.body.httpexpectedstatus;
  
    data["consumer"]["name"] = consumer;
    data["provider"]["name"] = provider;

    data["interactions"][0]["request"]["method"] = restmethod;
    data["interactions"][0]["request"]["path"] = restpath;

    data["interactions"][0]["response"]["status"] = status;
    data["interactions"][0]["response"]["body"] = responsebody;
    data["pact_contract"] =  "/pacts/provider/" + provider + "/consumer/" + consumer + "/version/1.0.0";

    // Set our collection
    var collection = db.get('usercollection');
    var id = require('mongodb').ObjectID;
    data["_id"] = id; //randomInt(10, 100);

    // Submit to the DB
    collection.insert(data, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database." + err);
        }
        else {
            // And forward to success page
            db.close();
            res.redirect("userlist");
        }
    });

    const request = require('request')
    pact_broker_url = "http://localhost/pacts/provider/" + provider + "/consumer/" + consumer + "/version/1.0.0";
        
    request.put(pact_broker_url, {
      json: data
    }, (error, res, body) => {
        if (error) {
            console.error(error)
        return
        }
        console.log(`statusCode: ${res.statusCode}`)
        console.log(body)
    })
});

module.exports = router;
