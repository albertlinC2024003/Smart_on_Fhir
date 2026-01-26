import {Box} from "@mui/material";
import { FhirQueryLoader, FhirValue } from "@bonfhir/react/r4b";
import {useFhirRead, useFhirSearch} from "@bonfhir/query/r4b";


const BonFhir = () => {
    const patientQuery = useFhirSearch("Patient");

    return (
        <Box>
            {/*<div>*/}
            {/*    <strong>姓名：</strong>*/}
            {/*    <FhirValue type="HumanName" value={patientResource.name} />*/}
            {/*</div>*/}
            {/*<div>*/}
            {/*    <strong>性別：</strong>*/}
            {/*    <FhirValue type="code" value={patientResource.gender} />*/}
            {/*</div>*/}
        </Box>
    );
};
export default BonFhir;