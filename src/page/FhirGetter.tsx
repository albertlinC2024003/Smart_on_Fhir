import { Box } from "@mui/material";
import CustomButton from "../component/input/CustomButton.tsx";
import {Form, useNavigate} from "react-router-dom";
import ScopeSelector from "./ScopeSelector.tsx";
import {useState} from "react";
import {useMutation, useQuery} from "@tanstack/react-query";
import {getFhir, getPrivate} from "../api/auth.ts";
import {useProvider} from "../utils/ComponentProvider.tsx";
import CustomRadio from "../component/input/CustomRadio.tsx";
import CustomFormRadio from "../component/input/form/CustomFormRadio.tsx";
import {FormProvider, useForm} from "react-hook-form";

const options = [
    { label: 'Patient', value: 'Patient' },
    { label: 'Encounter', value: 'Encounter' },
    { label: 'Observation', value: 'Observation' },
];

const data = {
    fhirResource: 'Patient'
};

const FhirGetter = () => {
    const navigate = useNavigate();
    const { popUp } = useProvider();
    const handleNavigate = (path: string) => {
        navigate(path);
    };

    const method = useForm({
        defaultValues: data
    });

    const { mutate: getData } = useMutation({
        mutationFn: async () => {
            const res = await getFhir(method.getValues("fhirResource"));
            return res.data;
        },
        onSuccess: (data) => {
            console.log('onSuccess:', data);
            if(data.code === 0) {
                popUp.openPopUp("成功取回資料", false);
            }else{
                popUp.openPopUp("取回資料失敗:"+data, true);
            }
        }
    });

    return (
        <Box className="flex flex-col items-center justify-center h-screen w-full text-2xl">
            <FormProvider {...method}>
                <Form>
                    <CustomFormRadio name={"fhirResource"} options={options} />
                    <CustomButton text={"取得FHIR資料"} onClick={() => getData()} />
                </Form>
            </FormProvider>
            <Box className={"flex mt-4 gap-2"}>
                <CustomButton text={"返回"} onClick={() => handleNavigate('/test')} />
            </Box>
        </Box>
    )
}
export default FhirGetter