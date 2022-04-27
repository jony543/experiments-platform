import { Db, MongoClient } from "mongodb";

let client: MongoClient;
let db: Db;

export type CollectionName = 'users' | 'workers' | 'sessions' | 'experiments';
export const getCollection = <T>(name: CollectionName) => db.collection<T>(name);
export const Collections = {
    initialize: (_db: Db, _client: MongoClient) => {
        db = _db;
        client = _client;
    },
    get Users() { return getCollection('users'); },
    get Sessions() { return getCollection('sessions'); },
}