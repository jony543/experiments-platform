import axios from "axios"
import { AuthParams } from '../../server/types/api';
import { User } from '../../server/types/models';

export const authenticate = async (username: string, password: string, register?: boolean) => {
    const user = (await axios.post(
        `/auth/${register ? 'register' : 'login'}`,
        { username, password } as AuthParams)).data as User;
    
}