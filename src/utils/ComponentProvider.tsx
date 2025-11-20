
import {createContext, type ReactNode, useContext,} from "react";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import PopUpProvider, { usePopUp } from "./module/PopupProvider";
import {localS, sessionS} from "./module/ProjectStorage";
import type {AuthMethod, PopUpMethod, StorageMethod} from "../dto/componentObj";
import { useAuth } from "./module/AuthProvider";
interface providerContextHolder {
    localStorage: StorageMethod;
    sessionStorage: StorageMethod;
    popUp: PopUpMethod;
    auth: AuthMethod;
}

const ProviderContext = createContext<providerContextHolder>({
    localStorage: localS,
    sessionStorage: sessionS,
    popUp: {} as PopUpMethod,
    auth: {} as AuthMethod,
});

export function useProvider(): providerContextHolder {
    const holder = useContext(ProviderContext);
    holder.popUp = usePopUp();
    holder.auth = useAuth();
    if (!holder) {
      throw new Error("useProvider must be used within an ProviderHolder");
    }
    return holder;
};
const queryClient = new QueryClient()
const ComponentProvider = ({children}:{ children: ReactNode }) => {
    const holder = useProvider();
    return (
        <ProviderContext.Provider value={holder}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <QueryClientProvider client={queryClient}>
                    <PopUpProvider></PopUpProvider>
                    {children}
                </QueryClientProvider>
            </LocalizationProvider>
        </ProviderContext.Provider>);
};
export default ComponentProvider;