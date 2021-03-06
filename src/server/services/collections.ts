import { omit } from "lodash";
import { Db, Filter, MongoClient, ObjectId, OptionalUnlessRequiredId } from "mongodb";
import { BaseModel, Experiment, Session, User, Worker } from "../types/models";
import { objectId } from "../utils/models";

let client: MongoClient;
let db: Db;

export const initializeCollections = (_db: Db, _client: MongoClient) => {
    db = _db;
    client = _client;
}
export type CollectionName = 'users' | 'workers' | 'sessions' | 'experiments';
export const getCollection = <T>(name: CollectionName) => db.collection<T>(name);
type CollectionModel<T extends CollectionName> =
    T extends 'sessions' ? Session :
    T extends 'users' ? User : 
    T extends 'experiments' ? Experiment :
    T extends 'workers' ? Worker :
    BaseModel;

export const find = <T extends CollectionName>(collectionName: T, filter: Filter<CollectionModel<T>>) =>
    getCollection<CollectionModel<T>>(collectionName).find(filter).toArray();
    
export const findOne = <T extends CollectionName>(collectionName: T, filter: Filter<CollectionModel<T>>) =>
    getCollection<CollectionModel<T>>(collectionName).findOne(filter);

export const get = <T extends CollectionName>(collectionName: T, id: string | ObjectId) => 
    findOne(collectionName, { _id: objectId(id) as any });

// TODO - createdAt
export const insertOne = async <T extends CollectionName>(collectionName: T, item: OptionalUnlessRequiredId<CollectionModel<T>>) => {
    const {insertedId} = await getCollection<CollectionModel<T>>(collectionName).insertOne(item);
    return await get(collectionName, insertedId);
};

// TODO - updatedAt
export const updateOne = async <T extends CollectionName>(collectionName: T, id: string | ObjectId, update: Partial<CollectionModel<T>>) =>
    getCollection<CollectionModel<T>>(collectionName).updateOne(
        {_id: objectId(id) as any}, 
        {$set: omit(update, '_id') as Partial<CollectionModel<T>>});

export const deleteOne = <T extends CollectionName>(collectionName: T, id: string | ObjectId) => 
    getCollection(collectionName).deleteOne({_id: objectId(id)});
