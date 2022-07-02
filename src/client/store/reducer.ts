import { ActionType, Store, StoreAction } from "./types";
import {modelId} from '../../server/utils/shared';

export const reducer = (state: Store = {workers: {}}, action: StoreAction): Store => {
    switch (action.type) {
        case ActionType.SET_USER:
            const {user} = action;
            return {...state, user};
        case ActionType.SET_EXPERIMENTS:
            const {experiments} = action;
            return {...state, experiments};
        case ActionType.EDIT_EXPERIMENT:
            const {experiment} = action;
            return {...state, experiments: state.experiments.map(exp => modelId(exp) == modelId(experiment) ? experiment : exp)};
        case ActionType.SET_WORKERS:
            const {workers, experimentId} = action;
            return {...state, workers: {...state.workers, [experimentId]: workers}}
        default:
            return state;
    }
}