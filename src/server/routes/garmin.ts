import express from 'express';
var bytes = require('bytes');

const app = express();
const garminRouter = express.Router();
const cors = require('cors');
const port = 443;                           // listen on this port to data from garmin 

app.use(express.json({limit: "1mb"}));      // Decode JSON data, unsuccesfully set max size to 1mb
app.use(express.urlencoded({limit: "1mb", extended: true, parameterLimit:50000})); // Decode Form URL Encoded data, maybe not necessary
app.use("/", garminRouter);
app.use(cors());

// connecting to mongoDB with specific uri
const {MongoClient} = require('mongodb');
const uri = "mongodb://schonberg-documentdb:k6f1Vrxj2gZPoLJuyvTTOsIb9zpSg8d2AjfQRKDUEtLe7XyQA2vCj8yEFl0ws6zqCmDIJi5RCqAcvWbL5WI7XA==@schonberg-documentdb.mongo.cosmos.azure.com:10255/garmin-experiments-db?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@schonberg-documentdb@";
const client = new MongoClient(uri);
client.connect();
const db = client.db("garmin-experiments-db");              // access specific database

app.listen(port,'0.0.0.0',()=>{                             // run the app and listen for data from garmin 
    console.log("server is listening on port", port);       // without using debug=true
});

// store the content of a new request in matching mongo collection
function updateDBCollection(collectionName:string, req){
    var collection = db.collection(collectionName);         // access subcollection with collectionName
    var rawData = req.body;                                 // the content of the request
    var newDocuments = rawData[collectionName];             // array of documents sent from garmin 
    
    newDocuments.forEach((doc : object) => {                // for each document in the array
        // define a new id field and insert the document if not exists       
        collection.updateOne({"new_id":doc["summaryId"]}, {$setOnInsert: doc}, {upsert:true});
    });
    // collection.insertMany(values, { ordered: true });        // insert at once an array of documents even if exists, creates duplicates
    console.log(`\n ~~~~~${collectionName} DATA SENT TO MONGO~~~~\n`);
}

// called by garmin server, process the request, '/test' is the relative path
garminRouter.post('/dest', async (req, res) => {
    // req.body is an object with one key (collectionName) and value (array of documents)
    const collectionName = Object.keys(req.body)[0];

    if (req.method == 'POST' &&
        req.headers['user-agent'] == 'Garmin Health API'){      // handle only post request from garmin
        updateDBCollection(collectionName, req);                // store data in mongodb
        return "success";
    }
    else
    {
        return "error";
    }
});

export default garminRouter;
