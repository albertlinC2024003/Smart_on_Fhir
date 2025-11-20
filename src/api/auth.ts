import { ReqUser, ResponseData } from '../dto/apiObj';
import { api } from './axiosConfig';
export const prepareLogin = async () => {
  return api.get<ResponseData<boolean>>('/auth/prepareLogin');
}
export const login = async (data: ReqUser) => { 
    return api.post<ResponseData<string>>('/auth/login', data);
}
export const logout = async () => { 
    return api.get<ResponseData<string>>('/auth/logout');
}