import {createContext, useContext} from "react";
import {useLocation, useNavigationType} from "react-router-dom";
interface PathDetail {
    currentPath: UrlPath;
    currentTab: TabId;
    historyMap: Map<UrlPath, TabId>;// key: path value: tab
}

export enum WebDirection{
    NONE = 'none',
    HISTORY = 'history',
    BACK = 'back',
    FORWARD = 'forward',
}

export enum TabId {
    //機構管理
    queryOrg = 'queryOrg',
    none = '',
}
export enum UrlPath {
    LOGIN = '/login',
    ERROR = '/error',
    TEST = '/test',
    NORMAL = '/normal',
    PRIVATE = '/private',
    FHIR_GETTER = '/fhirGetter',
    CODE_HANDLER = '/codeHandler',
    LOBBY = '/',
    VIEW_ORG = '/ViewOrg',
    NONE = '',
}

//因為Context中包含useState的方法 所以一開始先設置初始值 方法則是在Provider中設置
const CurrentPath = createContext<PathDetail>({
    currentPath: UrlPath.NONE,
    currentTab: TabId.none,
    historyMap: new Map<UrlPath, TabId>(),
});

export const usePathListener = () => {
    const context = useContext(CurrentPath);
    const recordPageChange = (current: UrlPath) => {
        const previousPath = context.currentPath;
        context.currentPath = current;
        context.currentTab = TabId.none;
        // console.log('changePage:', previousPath, ' --> ', context.currentPath)
    }
    const recordTabChange = (tab: TabId) => {
        const previousTab = context.currentTab;
        context.currentTab = tab;
        context.historyMap.set(context.currentPath, tab);
        // console.log( "存取=",context.currentPath, " : ", tab);
        if (previousTab !== '' && tab !== previousTab) {
            // console.log('changeTab:', previousTab, ' --> ', context.currentTab)
        }
    }
    const getPreviousTab = (): TabId => {
        const dir = detectDirection();
        let tab = context.historyMap.get(context.currentPath) || TabId.none;
        if(dir !== WebDirection.HISTORY){// 非使用瀏覽器的前進或後退按鈕 就回none(預設tab)
            tab = TabId.none;
        }
        return tab;
    }
    //使用瀏覽器的前進或後退按鈕
    const detectDirection = ():WebDirection => {
        const navigationType = useNavigationType();
        // const currentIdx = window.history.state?.idx ?? null;
        return navigationType === "POP" ? WebDirection.HISTORY : WebDirection.NONE;
    }
    if (!context) {
        throw new Error("usePathListener must be used within an PathListener");
    }
    return { context, recordPageChange, recordTabChange, getPreviousTab };
};

const PathListener = ({ children }) => {
    const { context, recordPageChange } = usePathListener();
    const location = useLocation();
    recordPageChange(location.pathname as UrlPath);
    return (
        <CurrentPath.Provider value={context}>
            {children}
        </CurrentPath.Provider>
    )
}

export default PathListener