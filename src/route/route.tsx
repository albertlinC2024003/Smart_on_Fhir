import {createBrowserRouter, Navigate, Outlet, RouterProvider} from "react-router-dom";
import Page from '../page/pageHolder';
import PathListener, {UrlPath} from "../utils/module/PathListener";
import { AuthStatus, PermissionId } from "../enum/system";
import { useProvider } from "../utils/ComponentProvider";

interface SidebarItem {
    barName: string,
    url: UrlPath
    permissionId: PermissionId
}
//permissionId: 有權限才會顯示
export const sidebarItems: SidebarItem[] = [
    { barName: '機構管理', url: UrlPath.VIEW_ORG, permissionId: PermissionId.CLOUD },
]

const ProtectedRouter = () => {
    const { auth } = useProvider();
    if (auth.authData.status === AuthStatus.Auth_SignedIn) {
        console.log('已登入')
        return (
            <PathListener>
                <Outlet />
            </PathListener>
        );
    } else {
        console.log('導轉')
        return <Navigate to={UrlPath.LOGIN} replace />;
    }
};
const routerData = createBrowserRouter(
    [
        {
            path: '*',
            element: <Navigate to={ UrlPath.ERROR } state={{ from: window.location.pathname }} replace />
        },
        {
            path: UrlPath.LOGIN,
            element: (
                <Page.Test />
            )
        },
        {
            path: UrlPath.EHR_ENTRY,
            element: (
                <Page.EHREntry />
            )
        },
        {
            path: UrlPath.EHR_LAUNCH,
            element: (
                <Page.EHRLaunch />
            )
        },
        {
            path: UrlPath.TEST,
            element: (
                <Page.Test />
            )
        },
        {
            path: UrlPath.NORMAL,
            element: (
                <Page.Normal />
            )
        },
        {
            path: UrlPath.PRIVATE,
            element: (
                <Page.Private />
            )
        },
        {
            path: UrlPath.FHIR_GETTER,
            element: (
                <Page.FhirGetter />
            )
        },
        {
            path: UrlPath.FHIR_REACT,
            element: (
                <Page.BonFhir />
            )
        },
        {
            path: UrlPath.CQL_GETTER,
            element: (
                <Page.CQLGetter />
            )
        },
        {
            path: UrlPath.V_SINGLE,
            element: (
                <Page.SingleResourceViewer />
            )
        },
        {
            path: UrlPath.CODE_HANDLER,
            element: (
                <Page.CodeHandler />
            )
        },
        {
            path: UrlPath.ERROR,
            element: (
                <Page.ErrorPage />
            )
        },
        {
            path: UrlPath.LOBBY,
            element: <ProtectedRouter />,
            errorElement: <Page.ErrorPage />,
            children: [
                { path: '', element: <Page.Lobby /> },
            ]
        },
    ],
    { basename: UrlPath.LOBBY }
)

//RouterProvider比較新
const MyRouter = () =>{
    return (<RouterProvider router={routerData} />)
}
export default MyRouter
export { ProtectedRouter, routerData }