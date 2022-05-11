import { ObjectId } from "mongodb";

export const objectId = (id: string | ObjectId) => (id && (typeof(id) === 'string')) ?
    new ObjectId(id) : id as ObjectId;