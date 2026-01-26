import { createContext, useContext, type ReactNode } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from "./module/AuthProvider";
import { useFhirStorage } from "./module/FhirStorage.tsx";
import {PopUpProvider, usePopUp} from "./module/PopUpRenderer.tsx";

export interface ProviderContextHolder {
    popUp: ReturnType<typeof usePopUp>;
    auth: ReturnType<typeof useAuth>;
    fhir: ReturnType<typeof useFhirStorage>;
}

const ProviderContext = createContext<ProviderContextHolder | undefined>(undefined);

export function useProvider(): ProviderContextHolder {
    const context = useContext(ProviderContext);
    if (!context) throw new Error("useProvider must be used within ComponentProvider");
    return context;
}
const queryClient = new QueryClient();

export const ComponentProvider = ({ children }: { children: ReactNode }) => {
    return (
        <PopUpProvider>
            <InnerProvider>{children}</InnerProvider>
        </PopUpProvider>
    );
};

// 把 hook 初始化放在 InnerProvider，確保 PopUpProvider 已經生成
const InnerProvider = ({ children }: { children: ReactNode }) => {
    const popUp = usePopUp();
    const auth = useAuth();
    const fhir = useFhirStorage();
    return (
        <ProviderContext.Provider value={{ popUp, auth, fhir }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </LocalizationProvider>
        </ProviderContext.Provider>
    );
};
export default ComponentProvider;
