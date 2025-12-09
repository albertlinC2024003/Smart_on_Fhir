import {Observation, Patient} from "../../../enum/fhir.ts";

export interface tsxProps {
    resource: Observation;
}
export const ObservationRender = ({resource}:tsxProps) => {
    console.log("ObservationRender", resource);
    return (
        <>
            <div>ID: {resource.id}</div>
            <div>病人: {resource.subject?.reference}</div>
            <div>類型: {resource.code?.coding?.[0].display}</div>
        </>
    )
};