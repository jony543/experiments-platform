import { ObjectId } from "mongodb";

export interface BaseModel {
    _id: ObjectId;
}

export interface User extends BaseModel {
    username: string;
    passwordHash: string;
    passwordSalt: string;
    role?: 'admin';
}

export interface Experiment extends BaseModel {
    name: string;
    user: ObjectId;
    git: string;
}

export interface Worker extends BaseModel {
    name: string;
    key: string;
    experiment: ObjectId;
}

export interface Session extends BaseModel {
    subId: ObjectId;
}