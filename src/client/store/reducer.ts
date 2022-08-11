import { ActionType, Store, StoreAction } from "./types";
import {modelId} from '../../server/utils/shared';

let notificationsCount = 0;

export const reducer = (state: Store = { // initial state
    workers: {}, 
    notifications: []
}, action: StoreAction): Store => {
    switch (action.type) {
        case ActionType.SET_USER:
            const {user} = action;
            return {...state, user};
        case ActionType.SET_USERS:
            const {users} = action;
            return {...state, users};
        case ActionType.SET_EXPERIMENTS:
            const {experiments} = action;
            return {...state, experiments};
        case ActionType.EDIT_EXPERIMENT:
            const {experiment} = action;
            return {...state, experiments: state.experiments.map(exp => modelId(exp) == modelId(experiment) ? experiment : exp)};
        case ActionType.SET_WORKERS:
            const {workers, experimentId} = action;
            return {...state, workers: {...state.workers, [experimentId]: workers}}
        case ActionType.NEW_NOTIFICATION:
            const {notification} = action;
            return {...state, notifications: [...state.notifications, {id: notificationsCount++, ...notification}]};
        case ActionType.NOTIFICATION_DISPLAYED:
            const {id: notificationId} = action;
            return {...state, notifications: state.notifications.map(n => n.id === notificationId ? {...n, displayed: true} : n)};
        default:
            return state;
    }
}