import {FhirResource} from "../../../enum/component.ts";
import {PatientRender} from "../parser/PatientRender.tsx";
import { Box } from "@mui/material";
import {ObservationRender} from "../parser/ObservationRender.tsx";

export interface tsxProps {
    resourceType: FhirResource;
    jsonStr: string;
}

const FhirResourceParser = ({resourceType, jsonStr }:tsxProps) => {
    if (!jsonStr) return <Box>json = undefined</Box>;
    try {
        const obj = JSON.parse(jsonStr);
        switch (resourceType) {
            case FhirResource.Patient:
                return <PatientRender resource={obj} />;
            case FhirResource.Observation:
                return <ObservationRender resource={obj} />;
            default:
                return <Box>null</Box>;
        }
    } catch {
        return <Box>解析失敗</Box>;
    }
};
export default FhirResourceParser;