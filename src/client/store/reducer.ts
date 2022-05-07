import { ActionType, Store, StoreAction } from "./types";

export const reducer = (state: Store = {}, action: StoreAction): Store => {
    switch (action.type) {
        case ActionType.SET_USER:
            const {user} = action;
            return {...state, user};
        default:
            return state;
    }
}