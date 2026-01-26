import { Box, TextField } from "@mui/material";
import CustomButton from "../component/input/CustomButton.tsx";
import {Form, useNavigate} from "react-router-dom";
import {useProvider} from "../utils/ComponentProvider.tsx";
import {FormProvider, useForm} from "react-hook-form";
import CustomFormRadio from "../component/input/form/CustomFormRadio.tsx";
import {useEffect, useState} from "react";
import CustomFormInput from "../component/input/form/CustomFormInput.tsx";
import {useMutation} from "@tanstack/react-query";
import {cqlQuery, getResourceList} from "../api/auth.ts";
import FhirResourceListReader from "./FhirResourceListReader.tsx";

const options = [
    { label: 'Patient', value: 'Patient' },
    { label: 'Encounter', value: 'Encounter' },
    { label: 'Observation', value: 'Observation' },
    { label: '自訂', value: 'Custom' },
];

const CQLTemplate = [
    { label: 'Patient', value:
        {
            "resourceType": "Parameters",
            "parameter": [
                {
                    "name": "expression",
                    "valueString": "[Patient] P where P.gender = 'male'"
                }
            ]
        }
    },
    { label: 'Encounter', value:
        {
            "resourceType": "Parameters",
            "parameter": [
                {
                    "name": "expression",
                    "valueString": "[Encounter] E where P.gender = 'male'"
                }
            ]
        }
    },
    { label: 'Observation', value:
        {
            "resourceType": "Parameters",
            "parameter": [
                {
                    "name": "expression",
                    "valueString": "[Observation] O where O.status = 'final'"
                }
            ]
        }
    },

]

interface searchParams {
    fhirResource: string;
    cql: string;
}

const defaultData: searchParams = {
    fhirResource: 'Patient',
    cql: ''
}

const CQLGetter = () => {
    const navigate = useNavigate();
    const { fhir } = useProvider();
    const [show, setShow] = useState(false);
    const [result, setResult] = useState('');
    const handleNavigate = (path: string) => {
        navigate(path);
    };

    const method = useForm({
        defaultValues: defaultData
    });

    const selectTemplate = () =>{
        const selected = method.getValues("fhirResource");
        const template = CQLTemplate.find(t => t.label === selected);
        if(template){
            method.setValue("cql", JSON.stringify(template.value, null, 2));
        } else {
            fhir.setFhirJson("");
        }
    }

    const { mutate: getData } = useMutation({
        mutationFn: async () => {
            const res = await cqlQuery(JSON.parse(method.getValues("cql")));
            return res.data;
        },
        onSuccess: (data) => {
            const resultStr = JSON.stringify(data);
            fhir.setFhirJson(resultStr)
            setResult(resultStr)
        }
    });

    useEffect(()=>{
        fhir.setFhirJson('')
    },[])

    return (
        <Box className="flex flex-col items-center justify-center h-screen w-full text-2xl">
            <FormProvider {...method}>
                <Form className={"flex flex-col"}>
                    <Box className={"flex gap-4"}>
                        <CustomFormRadio name={"fhirResource"} options={options} />
                        <CustomButton text={"產生範本"} onClick={() => {
                            selectTemplate();
                            setShow(true)
                        }} />
                        <CustomButton text={"查詢"} onClick={()=>{getData()}} />
                    </Box>
                    <Box className={"flex w-[1000px] h-[400px] mt-4"}>
                        {show &&
                            <CustomFormInput
                                className={"flex-1 h-full overflow-auto"}
                                name={"cql"}
                                multiline
                            />
                        }
                        {result &&
                            <TextField
                                value={result}
                                label={"查詢結果"}
                                multiline
                                minRows={8}
                                fullWidth
                                className={"flex-1 h-full overflow-auto"}
                            />
                        }
                    </Box>
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
export default CQLGetter