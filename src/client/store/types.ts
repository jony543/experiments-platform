import { Experiment, User, Worker } from "../../server/types/models";

export interface Notification {
    id: number;
    type: 'success' | 'info' | 'warning' | 'error',
    title: string;
    description: string;
    displayed?: boolean;
}

export type Store = {
    user?: User;
    experiments?: Experiment[];
    workers: Record<string, Worker[]>;
    users?: User[];
    notifications: Notification[];
}

export enum ActionType {
    SET_USER = 'SET_USER',
    SET_USERS = 'SET_USERS',
    SET_EXPERIMENTS = 'SET_EXPERIMENTS',
    EDIT_EXPERIMENT = 'EDIT_EXPERIMENT',
    SET_WORKERS = 'SET_WORKERS',
    NEW_NOTIFICATION = 'NEW_NOTIFICATION',
    NOTIFICATION_DISPLAYED = 'NOTIFICATION_DISPLAYED',
}
export type SetUserAction = {
    type: ActionType.SET_USER;
    user: User;
}
export type SetUsersAction = {
    type: ActionType.SET_USERS;
    users: User[];
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
export type NewNotification = {
    type: ActionType.NEW_NOTIFICATION,
    notification: Omit<Notification, 'id' | 'displayed'>,
}
export type MarkNotificationDisplayed = {
    type: ActionType.NOTIFICATION_DISPLAYED,
    id: number,
}
export type StoreAction = SetUserAction | SetUsersAction | SetExperimentsAction | EditExperimentAction | SetWorkersAction |
    NewNotification | MarkNotificationDisplayed;