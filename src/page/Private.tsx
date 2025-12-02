import { Box } from "@mui/material";
import CustomButton from "../component/input/CustomButton.tsx";
import {useNavigate} from "react-router-dom";
import ScopeSelector from "./ScopeSelector.tsx";
import {useState} from "react";
import {useQuery} from "@tanstack/react-query";
import {getPrivate} from "../api/auth.ts";


const Private = () => {
    const navigate = useNavigate();
    const handleNavigate = (path: string) => {
        navigate(path);
    };

    const [selectedScopes, setSelectedScopes] = useState<string[]>([]);

    const handleScopeConfirm = (scopes: string[]) => {
        setSelectedScopes(scopes);
        // 這裡可以進一步處理 scope，例如組合授權 URL 或顯示授權結果
        console.log("選擇的 scope:", scopes);
    };

    const { data } = useQuery({
        queryKey: ['privateData'],
        queryFn: getPrivate,
        retry: false,
    });

    return (
        <Box className="flex flex-col items-center justify-center h-screen w-full text-2xl">
            <ScopeSelector onConfirm={handleScopeConfirm} />
            <Box>以下是病人機密資料</Box>
            <Box className={"flex mt-4 gap-2"}>
                <CustomButton text={"返回"} onClick={() => handleNavigate('/test')} />
            </Box>
        </Box>
    )
}
export default Private