import { omit } from "lodash";
import { Db, Filter, MongoClient, ObjectId, OptionalId, OptionalUnlessRequiredId, WithId } from "mongodb";
import { BaseModel, Experiment, User } from "../types/models";
import { objectId } from "../utils/models";

let client: MongoClient;
let db: Db;

export const initializeCollections = (_db: Db, _client: MongoClient) => {
    db = _db;
    client = _client;
}
export type CollectionName = 'users' | 'workers' | 'sessions' | 'experiments' | 'garmin-experiments-db' | 'bart' | 'mgt';
export const getCollection = <T>(name: CollectionName) => db.collection<T>(name);
type CollectionModel<T extends CollectionName> = OptionalId<
    T extends 'users' ? User : 
    T extends 'experiments' ? Experiment :
    BaseModel
>;

export const find = <T extends CollectionName>(collectionName: T, filter: Filter<CollectionModel<T>>) =>
    getCollection<CollectionModel<T>>(collectionName).find(filter).toArray();
export const findOne = <T extends CollectionName>(collectionName: T, filter: Filter<CollectionModel<T>>) =>
    getCollection<CollectionModel<T>>(collectionName).findOne(filter);
export const get = <T extends CollectionName>(collectionName: T, id: string | ObjectId) => 
    findOne(collectionName, { _id: objectId(id) as any });
export const insertOne = async <T extends CollectionName>(collectionName: T, item: OptionalUnlessRequiredId<CollectionModel<T>>) => {
    const {insertedId} = await getCollection<CollectionModel<T>>(collectionName).insertOne(item);
    return await get(collectionName, insertedId);
}
export const updateOne = async <T extends CollectionName>(collectionName: T, id: string | ObjectId, update: Partial<CollectionModel<T>>) =>
    getCollection<CollectionModel<T>>(collectionName).updateOne({_id: objectId(id) as any}, {$set: omit(update, '_id') as Partial<CollectionModel<T>>})