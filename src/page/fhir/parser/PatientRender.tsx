import {Patient} from "../../../enum/fhir.ts";

export interface tsxProps {
    resource: Patient;
}
export const PatientRender = ({resource}:tsxProps) => (
    <>
        <div>ID: {resource.id}</div>
        <div>姓名: {resource.name?.[0]?.text}</div>
        <div>性別: {resource.gender}</div>
        <div>生日: {resource.birthDate}</div>
    </>
);