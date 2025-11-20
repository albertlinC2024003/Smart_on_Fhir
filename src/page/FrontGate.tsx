import { Box } from '@mui/material';
import { login, prepareLogin } from '../api/auth';
import {useEffect, useState} from 'react';
import { Form, useNavigate } from 'react-router-dom';
import CustomButton from '../component/input/CustomButton';
import { StorageKey } from '../enum/system';
import type { ReqUser } from '../dto/apiObj';
import CustomFormInput from '../component/input/form/CustomFormInput';
import { FormProvider, useForm } from 'react-hook-form';
import {useMutation} from "@tanstack/react-query";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {useProvider} from "../utils/ComponentProvider.tsx";

const FrontGate = () => {
    const nav = useNavigate();
    const { localStorage, auth } = useProvider();
    const methods = useForm<ReqUser>({
        defaultValues: {
            userId: '',
            pwd: '',
        }
    });
    const [showPwd, setShowPwd] = useState(false);
    const { handleSubmit, setValue, getValues, trigger } = methods;
    useEffect(() => {
        const userIdStore = localStorage.getItem(StorageKey.userId);
        if (userIdStore !== null) {
            setValue('userId', userIdStore);
        }
    }, [])

    function userLogin(){
        handleLogin();
    }
    const { mutate: handleLogin } = useMutation({
        onMutate: async () => {
            await prepareLogin();//先取CSRF token
        },
        mutationFn: async () => {
            const res = await login(getValues());
            return res.data;
        },
        onSuccess: (data) => {
            if(data.code === 0) {
                auth.authLogin(getValues('userId'));
                nav('/');
            }
        }
    });

    return (
        <Box className="flex flex-col justify-center h-screen justify-self-center"> 
            <Box className="justify-self-center justify-items-center">
                <Box className="pb-4 text-4xl">SmartApp</Box>
                <Box className="pb-4 text-2xl">登入</Box>
                <Box className="flex flex-col p-10 border-4 border-black rounded-3xl h-[250px] justify-around">
                    <FormProvider {...methods}>
                        <Form className="flex flex-col gap-4">
                            <Box className="flex items-center">
                                <CustomFormInput
                                    name="userId"
                                    label="帳號"
                                    required
                                    autoComplete="username"
                                    size="small"
                                />
                            </Box>
                            <Box className="relative flex items-center">
                                <CustomFormInput
                                    name="pwd"
                                    label="密碼"
                                    required
                                    autoComplete="current-password"
                                    type={showPwd ? 'text' : 'password'}
                                    size="small"
                                />
                                {showPwd ? (
                                    <Visibility
                                        className="absolute right-2 top-1/3 -translate-y-1/3 cursor-pointer text-emr-500"
                                        onClick={() => setShowPwd(false)}
                                    />
                                ) : (
                                    <VisibilityOff
                                        className="absolute right-2 top-1/3 -translate-y-1/3 cursor-pointer text-emr-500"
                                        onClick={() => setShowPwd(true)}
                                    />
                                )}
                            </Box>
                            <CustomButton
                                text='Login'
                                variant='contained'
                                type='submit'
                                onClick={handleSubmit(userLogin)}
                            />
                        </Form>
                    </FormProvider>
                </Box>
            </Box>
        </Box>
    )
}


export default FrontGate;
