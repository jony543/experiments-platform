import express from 'express';
import { getCollection } from '../services/collections';    // Function for access mongodb specific collection

const garminRouter = express.Router();
const garminCollection ="garmin-experiments-db";
const success = "success";
const err = "error";

// store the content of a new request in matching mongo collection
function updateDBCollection(collectionName:string, req){
    var collection = getCollection(garminCollection);       // access subcollection with collectionName
    var rawData = req.body;                                 // the content of the request
    var newDocuments = rawData[collectionName];             // array of documents sent from garmin 
    
    newDocuments.forEach((doc) => {                         // for each document in the array
        doc.type = collectionName;                          // add a new key named "type" with value collectionName
        // define a new id field and insert the document if not exists 
        collection.updateOne({"new_id":doc["summaryId"]}, {$setOnInsert: doc}, {upsert:true});
    });
    // print message
    console.log(`\n ~~~~~${collectionName} DATA SENT TO MONGO~~~~\n`);
}

// called by garmin server, process the request, '/test' is the relative path
garminRouter.post('/garmindata', async (req, res) => {
    // req.body is an object with one key (collectionName) and value (array of documents)
    const collectionName = Object.keys(req.body)[0];

    if (req.method == 'POST' &&
        req.headers['user-agent'] == 'Garmin Health API'){      // handle only post request from garmin
        updateDBCollection(collectionName, req);                // store data in mongodb
        res.send(success);                                    // return a promise, garmin expect 200 to be returned
    }
    else{
        res.send(err);
    }
});

export default garminRouter;
