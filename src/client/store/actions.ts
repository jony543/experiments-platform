import axios, { AxiosRequestConfig } from "axios"
import { Dispatch } from "redux";
import { AuthParams } from '../../server/types/api';
import { Experiment, User } from '../../server/types/models';
import { ActionType, EditExperimentAction, SetExperimentsAction, SetUserAction } from "./types";

const callApi = async <T>(dispatch: Dispatch, method: 'GET' | 'POST', url: string, data?: any) => {
    try {

        const result = await axios.request<T>({
            method, 
            url: APP_PREFIX + url,
            data,
        })
        if ((result.data as any).error) {
            throw new Error (data.error);
        }
        return result.data
    } catch (err) {
        if (err?.response?.status == 401) {
                dispatch({
                    type: ActionType.SET_USER,
                user: null,
            } as SetUserAction);
        }
    }
}

export const authenticate = (username: string, password: string, register?: boolean) => async (dispatch: Dispatch) => {
    const user = await callApi<User>(dispatch, 'POST',
        `/auth/${register ? 'register' : 'login'}`,
        { username, password } as AuthParams);
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
}