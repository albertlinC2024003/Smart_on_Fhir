import type {ReqUser, ResponseData} from '../dto/apiObj';
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

export const getNormal = async (data:any) => {
    return api.post<ResponseData<Map<string, string>>>('/normal/getData',{});
}
export const getPrivate = async (data:any) => {
    return api.post<ResponseData<Map<string, string>>>('/private/getData',{});
}
export const getFhirResource = async (fhirResource: string) => {
    return api.get<string>('/fhir/'+fhirResource);
}
export const getByFullUrl = async (fullUrl: string) => {
    return api.get<string>(fullUrl);
}
export const getResourceList = async (fhirResource: string) => {
    return api.get<string>('/fhir/'+fhirResource+'?_count=10&_format=json&_summary=true');
}