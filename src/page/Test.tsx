import {Box} from "@mui/material";
import CustomButton from "../component/input/CustomButton.tsx";
import {useNavigate} from "react-router-dom";
import {useProvider} from "../utils/ComponentProvider.tsx";
import {useEffect} from "react";
import {FhirResource} from "../enum/component.ts"; // 路徑依你的專案調整


const Test = () => {
    const navigate = useNavigate();
    const {fhir, auth, popUp} = useProvider();
    console.log('fhirJson=',fhir.fhirJson);
    const handleNavigate = (path: string) => {
        navigate(path);
    };
    useEffect(()=>{
        console.log('set fhirJson=',fhir.fhirJson);
    },[])
    return (
        <Box className="flex flex-col items-center justify-center h-screen w-full text-2xl">
            <Box>你好，歡迎使用SmartApp</Box>
            <Box className={"flex mt-4 gap-2"}>
                <CustomButton text={"登出"} onClick={() => auth.authLogout()} />
                <CustomButton text={"普通資料"} onClick={() => {
                    fhir.setFhirJson('empty');
                    fhir.setFhirResource(FhirResource.Patient);
                    handleNavigate('/normal');
                }} />
                <CustomButton text={"機密資料"} onClick={() => {
                    fhir.setFhirJson('full');
                    fhir.setFhirResource(FhirResource.Observation);
                    handleNavigate('/private');
                }} />
                <CustomButton text={"測試彈窗"} onClick={() => {
                    popUp.openPopUp('這是一個測試彈窗='+fhir.fhirResource, false);
                }} />
                <CustomButton text={"Fhir資料"} onClick={() => handleNavigate('/fhirGetter')} />
            </Box>
        </Box>
    )
}

export default Test