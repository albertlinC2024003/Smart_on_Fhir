import { createTheme, ThemeProvider } from "@mui/material";
import ComponentProvider from './utils/ComponentProvider';
import AxiosInstance from './utils/module/AxiosInstance';
import AuthProvider from "./utils/module/AuthProvider.tsx";
import { Provider } from 'react-redux'
import MyRouter from "./route/route.tsx";
import store from "./utils/module/reduxStore.ts";
import './assets/css/tailwind.css'
import {FhirUIProvider} from "@bonfhir/react/r4b";
import { MantineRenderer } from "@bonfhir/mantine/r4b";
import { MantineProvider } from "@mantine/core";
import {FhirProvider} from "./utils/module/FhirContext.tsx";

const theme = createTheme({
    palette: {
        primary: {
            main: '#086f30',
        },
    },
    typography: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
    },
    spacing: 0,
});

function App() {
    return (
        <>
            <FhirProvider>
                <AuthProvider>
                    <ThemeProvider theme={theme}>
                        <Provider store={store}>
                            <MantineProvider>
                                <FhirUIProvider renderer={MantineRenderer}>
                                    <ComponentProvider>
                                        <AxiosInstance>
                                            <MyRouter/>
                                        </AxiosInstance>
                                    </ComponentProvider>
                                </FhirUIProvider>
                            </MantineProvider>
                        </Provider>
                    </ThemeProvider>
                </AuthProvider>
            </FhirProvider>
        </>
    )
}

export default App
