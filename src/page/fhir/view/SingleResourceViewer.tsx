import {useQuery} from "@tanstack/react-query";
import {getByFullUrl} from "../../../api/auth.ts";
import CustomButton from "../../../component/input/CustomButton.tsx";
import {Box} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {useProvider} from "../../../utils/ComponentProvider.tsx";
import FhirResourceParser from "./FhirResourceParser.tsx";
import {useEffect, useState} from "react";

const SingleResourceViewer = () =>{
    const navigate = useNavigate();
    const {fhir} = useProvider();
    const [content, setContent] = useState<string>();
    const {data} = useQuery({
        queryKey: ['fhirResource', fhir.fullUrl],
        queryFn: async () => {
            return await getByFullUrl(fhir.fullUrl);
        }
    })
    useEffect(()=>{
        if(data){
            setContent(JSON.stringify(data.data));
        }
    },[data])
    return (
        <Box className={"flex flex-col justify-center items-center"}>
            <Box>Single Resource Viewer</Box>
            <Box className={"my-4 gap-2 w-[1000px] bg-amber-100 border-4"}>
                <FhirResourceParser resourceType={fhir.fhirResource} jsonStr={content} />
            </Box>
            <CustomButton text={"返回"} onClick={() => navigate('/fhirGetter')} />
        </Box>
    );
}
export default SingleResourceViewer;