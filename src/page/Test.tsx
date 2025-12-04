import { Box } from "@mui/material";
import CustomButton from "../component/input/CustomButton.tsx";
import {useNavigate} from "react-router-dom";
import {useProvider} from "../utils/ComponentProvider.tsx"; // 路徑依你的專案調整


const Test = () => {
    const navigate = useNavigate();
    const {auth} = useProvider();
    const handleNavigate = (path: string) => {
        navigate(path);
    };
    return (
        <Box className="flex flex-col items-center justify-center h-screen w-full text-2xl">
            <Box>你好，歡迎使用SmartApp</Box>
            <Box className={"flex mt-4 gap-2"}>
                <CustomButton text={"登出"} onClick={() => auth.authLogout()} />
                <CustomButton text={"普通資料"} onClick={() => handleNavigate('/normal')} />
                <CustomButton text={"機密資料"} onClick={() => handleNavigate('/private')} />
                <CustomButton text={"Fhir資料"} onClick={() => handleNavigate('/fhirGetter')} />
            </Box>
        </Box>
    )
}

export default Test