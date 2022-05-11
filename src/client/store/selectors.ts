import {Store} from './types';
import { createSelector } from 'reselect';

const rootSelector = store => store.root as Store;
export const getUser = createSelector(rootSelector, store => store.user);
export const getExperiments = createSelector(rootSelector, store => store.experiments);