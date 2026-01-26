import {Patient} from "../../../enum/fhir.ts";
import { FhirValue } from "@bonfhir/react/r4b";

export interface tsxProps {
    resource: Patient;
}
export const PatientRender = ({resource}:tsxProps) => (
    <>
        <div>ID: {resource.id}</div>
        <div>姓名: {resource.name?.[0]?.text}</div>
        <div>性別: {resource.gender}</div>
        <div>生日: {resource.birthDate}</div>
        <div>
            <strong>姓名：</strong>
            <FhirValue type="HumanName" value={resource.name} />
        </div>
        <div>
            <strong>性別：</strong>
            <FhirValue type="code" value={resource.gender} />
        </div>
    </>
);