import {useLocation, useRouteError} from "react-router-dom";

export default function ErrorPage() {
    const location = useLocation();
    const from = location.state?.from;
    const error = useRouteError();

    let errorMessage = "";
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === "string") {
        errorMessage = error;
    } else {
        errorMessage = JSON.stringify(error);
    }

    return (
        <div id="error-page">
            <h1>發生未預期錯誤</h1>
            <p>錯誤路徑：{from || location.pathname}</p>
            <div>錯誤原因如下:</div>
            <div>{errorMessage}</div>
        </div>
    );
}