import { omit } from "lodash";
import { Db, Filter, FindOptions, MongoClient, ObjectId, OptionalUnlessRequiredId, UpdateFilter } from "mongodb";
import { BaseModel, Experiment, Session, User, Worker } from "../types/models";
import { objectId } from "../utils/models";

let client: MongoClient;
let db: Db;

export const initializeCollections = (_db: Db, _client: MongoClient) => {
    db = _db;
    client = _client;
}
export type CollectionName = 'users' | 'workers' | 'sessions' | 'experiments' | 'garmin-experiments-db';
export const getCollection = <T>(name: CollectionName) => db.collection<T>(name);
type CollectionModel<T extends CollectionName> =
    T extends 'sessions' ? Session :
    T extends 'users' ? User : 
    T extends 'experiments' ? Experiment :
    T extends 'workers' ? Worker :
    BaseModel;

export const find = <T extends CollectionName>(collectionName: T, filter: Filter<CollectionModel<T>>, options?: FindOptions<CollectionModel<T>>) =>
    getCollection<CollectionModel<T>>(collectionName).find(filter, options).toArray();
    
export const findOne = <T extends CollectionName>(collectionName: T, filter: Filter<CollectionModel<T>>, options?: FindOptions<CollectionModel<T>>) =>
    getCollection<CollectionModel<T>>(collectionName).findOne(filter, options);

export const get = <T extends CollectionName>(collectionName: T, id: string | ObjectId) => 
    findOne(collectionName, { _id: objectId(id) as any });

export const create = async <T extends CollectionName>(
    collectionName: T,
    item: OptionalUnlessRequiredId<CollectionModel<T>> | OptionalUnlessRequiredId<CollectionModel<T>>[]) => {
        if (item instanceof Array) {
            var result = await getCollection<CollectionModel<T>>(collectionName).insertMany(item.map(x => ({...x, createdAt: new Date()})));
            return Object.values(result.insertedIds);
        } else {
            const {insertedId} = await getCollection<CollectionModel<T>>(collectionName).insertOne({...item, createdAt: new Date()});
            return [insertedId];
        }
};

export const update = async <T extends CollectionName>(collectionName: T, id: string | ObjectId, update: Partial<CollectionModel<T>>) =>
    getCollection<CollectionModel<T>>(collectionName).updateOne(
        {_id: objectId(id) as any}, 
        {
            $set: omit(update, '_id') as Partial<CollectionModel<T>>, 
            $currentDate: {updatedAt: true} as UpdateFilter<BaseModel>['$currentDate'],
        });

export const deleteOne = <T extends CollectionName>(collectionName: T, id: string | ObjectId) => 
    getCollection(collectionName).deleteOne({_id: objectId(id)});
