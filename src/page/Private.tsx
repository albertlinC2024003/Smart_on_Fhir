import { Box } from "@mui/material";
import CustomButton from "../component/input/CustomButton.tsx";
import {useNavigate} from "react-router-dom";
import ScopeSelector from "./ScopeSelector.tsx";
import {useState} from "react";
import {useMutation, useQuery} from "@tanstack/react-query";
import {getPrivate} from "../api/auth.ts";
import {useProvider} from "../utils/ComponentProvider.tsx";


const Private = () => {
    const navigate = useNavigate();
    const { fhir, popUp } = useProvider();
    const handleNavigate = (path: string) => {
        navigate(path);
    };

    const [selectedScopes, setSelectedScopes] = useState<string[]>([]);

    const handleScopeConfirm = (scopes: string[]) => {
        setSelectedScopes(scopes);
        // 這裡可以進一步處理 scope，例如組合授權 URL 或顯示授權結果
        console.log("選擇的 scope:", scopes);
    };

    const { mutate: handleData } = useMutation({
        mutationFn: async () => {
            const res = await getPrivate({});
            return res.data;
        },
        onSuccess: (data) => {
            console.log('onSuccess:', data);
            if(data.code === 0) {
                popUp.openPopUp("成功取回資料", false);
            }else{
                popUp.openPopUp("取回資料失敗:"+data, true);
            }
        }
    });
    console.log('private fhirJson=',fhir.fhirJson);
    return (
        <Box className="flex flex-col items-center justify-center h-screen w-full text-2xl">
            <ScopeSelector onConfirm={handleScopeConfirm} />
            <CustomButton text={"取得病人機密資料"} onClick={() => handleData()} />
            <Box className={"flex mt-4 gap-2"}>
                <CustomButton text={"返回"} onClick={() => handleNavigate('/test')} />
            </Box>
        </Box>
    )
}
export default Private