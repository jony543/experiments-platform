import axios from "axios";
import { Dispatch } from "redux";
import { AuthParams } from '../../server/types/api';
import { Experiment, User, Worker } from '../../server/types/models';
import { ActionType, EditExperimentAction, NewNotification, Notification, SetExperimentsAction, SetUserAction, SetUsersAction, SetWorkersAction } from "./types";

export const showNotification = (type: Notification['type'], title: Notification['title'], description: Notification['description']) => (dispatch: Dispatch) => {
    dispatch({
        type: ActionType.NEW_NOTIFICATION,
        notification: {
            type,
            title,
            description,
        }
    } as NewNotification);
}

const callApi = async <T>(dispatch: Dispatch, method: 'GET' | 'POST' | 'DELETE', url: string, data?: any) => {
    try {
        const result = await axios.request<T>({
            method, 
            url: APP_PREFIX + url,
            data,
        })
        if ((result.data as any).error) {
            showNotification('error', `${method} ${url}`, 'request failed with error: ' + data.error)(dispatch);
            throw new Error (data.error);
        } else {
            showNotification(result.status < 300 ? 'success' : 'warning', `${method} ${url}`, 'request completed with status: ' + result.status)(dispatch);
            return result.data;
        }
    } catch (err) {
        const status = err?.response?.status;
        showNotification('error', `${method} ${url}`, status ? 'request completed with status: ' + status : 'request error: ' + err)(dispatch);
        if (status == 401) {
                dispatch({
                    type: ActionType.SET_USER,
                user: null,
            } as SetUserAction);
        }
    }
}

export type AuthAction = 'register' | 'login' | 'resetPassword';
export const authenticate = (username: string, password: string, action: AuthAction, newPassword?: string) => async (dispatch: Dispatch) => {
    const user = await callApi<User>(dispatch, 'POST',
        `/auth/${action}`,
        { username, password, newPassword } as AuthParams);
    dispatch({
        type: ActionType.SET_USER,
        user,
    } as SetUserAction);
}

export const fetchUser = () => async (dispatch: Dispatch) => {
    const user = await callApi<User>(dispatch, 'GET', `/admin-api/user`);
    dispatch({
        type: ActionType.SET_USER,
        user,
    } as SetUserAction);
}

export const fetchUsers = () => async (dispatch: Dispatch) => {
    const users = await callApi<User[]>(dispatch, 'GET', `/admin-api/users`);
    dispatch({
        type: ActionType.SET_USERS,
        users,
    } as SetUsersAction);
}

export const createUser = (params: Partial<AuthParams>) => async (dispatch: Dispatch) => {
    await callApi<Experiment>(dispatch, 'POST', `/admin-api/users`, params);
    fetchUsers()(dispatch);
}

export const editUser = (userId:string, params: Partial<AuthParams>) => async (dispatch: Dispatch) => {
    await callApi<Experiment>(dispatch, 'POST', `/admin-api/users/${userId}`, params);
    fetchUsers()(dispatch);
}

export const fetchExperiments = () => async (dispatch: Dispatch) => {
    const experiments = await callApi<Experiment[]>(dispatch, 'GET', `/admin-api/experiments`);
    dispatch({
        type: ActionType.SET_EXPERIMENTS,
        experiments,
    } as SetExperimentsAction);
}

export const editExperiment = (editData: Partial<Experiment>) => async (dispatch: Dispatch) => {
    const experiment = await callApi<Experiment>(dispatch, 'POST', `/admin-api/experiments`, editData);
    dispatch({
        type: ActionType.EDIT_EXPERIMENT,
        experiment,
    } as EditExperimentAction);
    fetchExperiments()(dispatch);
}

export const deleteExperiment = (experimentId: string) => async (dispatch: Dispatch) => {
    await callApi<Experiment>(dispatch, 'DELETE', `/admin-api/experiments/${experimentId}`);
    fetchExperiments()(dispatch);
}

export const fetchWorkers = (experimentId: string) => async (dispatch: Dispatch) => {
    const workers = await callApi<Worker[]>(dispatch, 'GET', `/admin-api/experiments/${experimentId}/workers`);
    dispatch({
        type: ActionType.SET_WORKERS,
        workers,
        experimentId,
    } as SetWorkersAction);
}

export const editWorker = (experimentId: string, editDate: Partial<Worker>) => async (dispatch: Dispatch) => {
    const workers = await callApi<Worker[]>(dispatch, 'POST', `/admin-api/experiments/${experimentId}/workers`, editDate);
    fetchWorkers(experimentId)(dispatch);
}