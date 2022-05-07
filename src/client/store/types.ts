import { User } from "../../server/types/models"

export type Store = {
    user?: User;
}

export enum ActionType {
    SET_USER = 'SET_USER',
}
export type SetUserAction = {
    type: ActionType.SET_USER;
    user: User;
}
export type StoreAction = SetUserAction;