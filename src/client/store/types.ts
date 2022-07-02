import { Experiment, User, Worker } from "../../server/types/models"

export type Store = {
    user?: User;
    experiments?: Experiment[];
    workers?: Record<string, Worker[]>;
}

export enum ActionType {
    SET_USER = 'SET_USER',
    SET_EXPERIMENTS = 'SET_EXPERIMENTS',
    EDIT_EXPERIMENT = 'EDIT_EXPERIMENT',
    SET_WORKERS = 'SET_WORKERS',
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
export type SetWorkersAction = {
    type: ActionType.SET_WORKERS;
    experimentId: string;
    workers: Worker[];
}
export type StoreAction = SetUserAction | SetExperimentsAction | EditExperimentAction | SetWorkersAction;