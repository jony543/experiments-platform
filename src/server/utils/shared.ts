import { ObjectId } from "mongodb"
import { BaseModel } from "../types/models";

export const idString = (id: string | ObjectId) => id && (typeof(id) === 'string' ? id : (id as ObjectId).toHexString());
export const modelId = (model: BaseModel) => idString(model?._id);