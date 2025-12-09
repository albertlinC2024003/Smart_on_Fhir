import { Box } from "@mui/material";
import CustomButton from "../component/input/CustomButton.tsx";
import {Form, useNavigate} from "react-router-dom";
import {useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {getResourceList} from "../api/auth.ts";
import {useProvider} from "../utils/ComponentProvider.tsx";
import CustomFormRadio from "../component/input/form/CustomFormRadio.tsx";
import {FormProvider, useForm} from "react-hook-form";
import {FhirBundle} from "../dto/dataObj.ts";
import FhirResourceParser from "./fhir/view/FhirResourceParser.tsx";
import {FhirResource} from "../enum/component.ts";
import FhirResourceListReader from "./FhirResourceListReader.tsx";

const options = [
    { label: 'Patient', value: 'Patient' },
    { label: 'Encounter', value: 'Encounter' },
    { label: 'Observation', value: 'Observation' },
];

interface searchParams {
    fhirResource: string;
}

const defaultData: searchParams = {
    fhirResource: 'Patient'
}

const FhirGetter = () => {
    const navigate = useNavigate();
    const { fhir } = useProvider();
    const handleNavigate = (path: string) => {
        navigate(path);
    };

    const method = useForm({
        defaultValues: defaultData
    });

    const { mutate: getData } = useMutation({
        mutationFn: async () => {
            const res = await getResourceList(method.getValues("fhirResource"));
            return res.data;
        },
        onSuccess: (data) => {
            fhir.setFhirJson(JSON.stringify(data))
        }
    });

    return (
        <Box className="flex flex-col items-center justify-center h-screen w-full text-2xl">
            <FormProvider {...method}>
                <Form className={"flex flex-col"}>
                    <CustomFormRadio name={"fhirResource"} options={options} />
                    <CustomButton text={"取得FHIR資料"} onClick={() => getData()} />
                </Form>
            </FormProvider>
            {fhir.fhirJson && (
                <FhirResourceListReader />
            )}
            <Box className={"flex mt-4 gap-2"}>
                <CustomButton text={"返回"} onClick={() => handleNavigate('/test')} />
            </Box>

        </Box>
    )
}
export default FhirGetter