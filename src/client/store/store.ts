import {combineReducers, createStore, compose, applyMiddleware, AnyAction} from 'redux';
import { reducer } from './reducer';
import thunkMiddleware, { ThunkDispatch } from 'redux-thunk';
import { useDispatch } from 'react-redux';
import { Store } from './types';

const store = createStore(combineReducers({root: reducer}), applyMiddleware(thunkMiddleware));
export const useStoreDispatch = () => useDispatch<ThunkDispatch<Store, unknown, AnyAction>>();
export default store;