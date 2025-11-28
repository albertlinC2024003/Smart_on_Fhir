import { createTheme, ThemeProvider } from "@mui/material";
import ComponentProvider from './utils/ComponentProvider';
import AxiosInstance from './utils/module/AxiosInstance';
import AuthProvider from "./utils/module/AuthProvider.tsx";
import { Provider } from 'react-redux'
import MyRouter from "./route/route.tsx";
import store from "./utils/module/reduxStore.ts";
import './assets/css/tailwind.css'

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
            <AuthProvider>
                <AxiosInstance>
                    <ThemeProvider theme={theme}>
                        <Provider store={store}>
                            <ComponentProvider>
                                <MyRouter>
                                </MyRouter>
                            </ComponentProvider>
                        </Provider>
                    </ThemeProvider>
                </AxiosInstance>
            </AuthProvider>
        </>
    )
}

export default App
