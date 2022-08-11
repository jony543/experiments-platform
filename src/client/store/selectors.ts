import {Store} from './types';
import { createSelector } from 'reselect';
import { Selector } from 'react-redux';
import { notification } from 'antd';

const rootSelector = store => store.root as Store;
export const getUser = createSelector(rootSelector, store => store.user);

const getKeyValueSelector = <S, T>(selector: Selector<S, T[]>, key: keyof T) => 
    createSelector(selector, arr => arr?.reduce<Record<string, T>>((dict, val) => ({...dict, [val[key] as unknown as string]: val}),{}));

export const getUsers = createSelector(rootSelector, store => store.users);
export const getExperiments = createSelector(rootSelector, store => store.experiments);
export const getExperimentsDict = getKeyValueSelector(getExperiments, '_id');
export const getWorkers = (experimentId: string) => createSelector(rootSelector, store => store.workers[experimentId]);
export const getWorkersDict = (experimentId: string) => getKeyValueSelector(getWorkers(experimentId), '_id');

export const getNotifications = createSelector(rootSelector, store => store.notifications);
export const getNotificationsToDisplay = createSelector(getNotifications, notifications => notifications.filter(n => !n.displayed));