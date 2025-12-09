
import {createContext, type ReactNode, useContext,} from "react";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import PopUpRenderer, { usePopUp } from "./module/PopUpRenderer.tsx";
import {localS, sessionS} from "./module/ProjectStorage";
import type {AuthMethod, FhirStorage, PopUpMethod, StorageMethod} from "../dto/componentObj";
import { useAuth } from "./module/AuthProvider";
import {useFhirStorage} from "./module/FhirStorage.tsx";
interface providerContextHolder {
    localStorage: StorageMethod;
    sessionStorage: StorageMethod;
    popUp: PopUpMethod;
    auth: AuthMethod;
    fhir: FhirStorage;
}

const ProviderContext = createContext<providerContextHolder>({
    localStorage: localS,
    sessionStorage: sessionS,
    popUp: {} as PopUpMethod,
    auth: {} as AuthMethod,
    fhir: {} as FhirStorage,
});

export function useProvider(): providerContextHolder {
    const holder = useContext(ProviderContext);
    if (!holder) {
      throw new Error("useProvider must be used within an ProviderHolder");
    }
    return holder;
}
const queryClient = new QueryClient()
const ComponentProvider = ({children}:{ children: ReactNode }) => {
    const holder = useProvider();
    //初始化各個module的hook並放入context中 不要在useProvider中初始化 否則每次呼叫useProvider都會重新初始化一次(主要是影響資料狀態的module 函數的可能不影響)
    holder.popUp = usePopUp();
    holder.auth = useAuth();
    holder.fhir = useFhirStorage();
    return (
        <ProviderContext.Provider value={holder}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <QueryClientProvider client={queryClient}>
                    <PopUpRenderer />
                    {children}
                </QueryClientProvider>
            </LocalizationProvider>
        </ProviderContext.Provider>);
};
export default ComponentProvider;