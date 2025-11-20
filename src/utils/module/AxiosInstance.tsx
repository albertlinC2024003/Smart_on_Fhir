import { useEffect } from 'react'
import { api } from '../../api/axiosConfig';
import { useProvider } from '../ComponentProvider';
import { ResponseData } from '../../dto/apiObj';
import { AxiosError } from 'axios';

const AxiosInstance = ({children}) => {
    const {popUp} = useProvider();
   
    //為了讓axios可以使用hook，所以在這裡添加一個額外的interceptor
    useEffect(() => {
        //http status不是200的時候，進入這個interceptor
        const res_error = (error:AxiosError<ResponseData<object>>) => {
            if (error.response.status === 403) {
                window.location.href = '/login';
            }
            if (error.response.data.code === 101 || error.response.data.code === 105) {
                window.location.href = '/login';
            } else if(error.response.data.msg) {
                popUp.openPopUp(error.response.data.msg, true);
            } else {
                popUp.openPopUp('系統錯誤:'+error.message, true);
            }
            return Promise.reject(error);
        }
        const res_interceptor = api.interceptors.response.use(null, res_error);
        return () => {
            api.interceptors.response.eject(res_interceptor);
        };
    }, [])
    return children
}

export default AxiosInstance