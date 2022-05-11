import { Experiment, User } from "../../server/types/models"

export type Store = {
    user?: User;
    experiments?: Experiment[];
}

export enum ActionType {
    SET_USER = 'SET_USER',
    SET_EXPERIMENTS = 'SET_EXPERIMENTS',
    EDIT_EXPERIMENT = 'EDIT_EXPERIMENT',
}
export type SetUserAction = {
    type: ActionType.SET_USER;
    user: User;
}
export type SetExperimentsAction = {
    type: ActionType.SET_EXPERIMENTS;
    experiments: Experiment[];
}
export type EditExperimentAction = {
    type: ActionType.EDIT_EXPERIMENT;
    experiment: Experiment;
}
export type StoreAction = SetUserAction | SetExperimentsAction | EditExperimentAction;