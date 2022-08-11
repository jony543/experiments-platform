import axios from "axios";
import { Session } from "../types/models";
import { idString } from "./shared";

declare global {
    var APP_PREFIX: string;
}

const callApi = async <T>(method: 'GET' | 'POST', url: string, data?: any) => {
    const result = await axios.request<T>({
        method, 
        url: APP_PREFIX + '/workers-api' + url,
        data,
    })
    if ((result.data as any).error) {
        throw new Error (data.error);
    }
    return result.data
}

const platform: {sessionId?: string} = {};

const getAllSessions = () => callApi('GET', '/sessions');
const getSession = (sessionId?: string) => callApi('GET', `/sessions/${sessionId || platform.sessionId}`);
const saveSession = (data: any, createNew?: boolean) => {
    if (!data._id && platform.sessionId && !createNew) {
        data._id = platform.sessionId;
    }
    return callApi('POST', '/sessions', data).then((result: Session) => {
        platform.sessionId = idString(result._id);
        return result;
    });
};
const goToUrl = (url: string) => {
    const experimentName = window.location.pathname.match(/\/experiment\/[^\/]*\//)[0];
    const start = window.location.pathname.substring(0, window.location.pathname.indexOf(experimentName));
    window.location.pathname = start + experimentName + url;
}

Object.assign(platform, {getSession, getAllSessions, saveSession, goToUrl});
Object.assign(window, {platform});