import { Box } from "@mui/material";
import CustomButton from "../component/input/CustomButton.tsx";
import {useNavigate} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {getNormal} from "../api/auth.ts";


const Normal = () => {
    const navigate = useNavigate();
    const handleNavigate = (path: string) => {
        navigate(path);
    };
    const { data } = useQuery({
        queryKey: ['normalData'],
        queryFn: getNormal,
    });
    return (
        <Box className="flex flex-col items-center justify-center h-screen w-full text-2xl">
            <Box>以下是普通資料</Box>
            {data?.data.data && Object.entries(data.data.data).map(([key, value]) => (
                <Box key={key}>
                    {key}: {String(value)}
                </Box>
            ))}
            <Box className={"flex mt-4 gap-2"}>
                <CustomButton text={"返回"} onClick={() => handleNavigate('/test')} />
            </Box>
        </Box>
    )
}
export default Normal