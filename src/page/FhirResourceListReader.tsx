import { Box } from "@mui/material";
import { parseBundleToSummaryArray } from "../utils/FhirUtils";
import {ISummary} from "../enum/fhir.ts";
import CustomButton from "../component/input/CustomButton.tsx";
import {useNavigate} from "react-router-dom";
import {useProvider} from "../utils/ComponentProvider.tsx";
import {FhirResource} from "../enum/component.ts";
import DisplayTable from "../component/DisplayTable.tsx";
import {ColumnDef} from "@tanstack/react-table";
import {columnTool} from "../utils/commonTool.tsx";

const resourceTypeMap = Object.fromEntries(
    Object.values(FhirResource).map(key => [key, FhirResource[key as keyof typeof FhirResource]])
);

const tool = columnTool<ISummary>();
const columns: ColumnDef<ISummary, any>[] = [
    tool.columnHelper.accessor(row => row.resource?.resourceType, {
        header: "資源類型",
        cell: info => info.getValue(),
    }),
    tool.columnHelper.accessor(row => row.resource?.id, {
        header: "ID",
        cell: info => info.getValue(),
    }),
    tool.columnHelper.accessor(row => row.resource?.meta?.lastUpdated, {
        header: "更新時間",
        cell: info => info.getValue(),
    }),
]

function FhirResourceListReader() {
    const {fhir} = useProvider();
    const summaryList: ISummary[] = parseBundleToSummaryArray(fhir.fhirJson);
    const navigate = useNavigate();
    const setResourceType = (resourceType: string) =>{
        const resource = resourceTypeMap[resourceType];
        if (resource) {
            fhir.setFhirResource(resource);
        }
    }
    const btn = tool.columnHelper.accessor("button",{
        id: 'btn',
        header: '檢視',
        cell: info => {
            const item = info.row.original;
            return(
                <CustomButton text={"檢視"} onClick={()=>{
                    setResourceType(item.resource?.resourceType);
                    fhir.setFullUrl(item.fullUrl);
                    navigate('/SingleResourceViewer');
                }}/>
            )
        },
    })

    const fullColumn = [...columns, btn];
    return (
        <Box className={" mt-4 gap-2 w-full"}>
            {summaryList.length > 0 && (
                <DisplayTable
                    columnDef={fullColumn}
                    tableData={summaryList}
                />
            )}
        </Box>
    );
}
export default FhirResourceListReader;