import type { ColumnDef, Row } from "@tanstack/react-table";
import type { PageData } from "./apiObj";
import type { TextFieldProps} from "@mui/material";
import type { UseQueryResult } from "@tanstack/react-query";
import type { AuthData } from "./dataObj";
import type { QueryPK } from "../enum/tanstackQueryKey";
import type {StorageKey} from "../enum/system";
import {FhirResource, PopupSize} from "../enum/component";

export interface ComponentOption {
    label: string
    value: string | number | boolean // value可以是string, number, boolean
}
export interface FormInputProps extends Omit<TextFieldProps, 'name'>{
    name: string;
    label?: string;
    showLabel?: boolean;//輸入外框上是否顯示標籤
    // value?: string;
    errorSpace?: boolean; //是否要保留錯誤提示的空間
    defaultValue?: string | number | boolean; // 預設值
    required?: boolean;
    validateRule?: (value: string) => string | boolean;
    className?: string;
    // options?: ComponentOption[];
}

export interface PageableTableProps<T> {
    columnDef: ColumnDef<T, any>[],
    api: (query: any) => Promise<PageData<T>>
    queryPK: QueryPK,
    queryMethod?: (query: any, pagination?: { pageIndex: number; pageSize: number}) => UseQueryResult<PageData<T>>;
    // handleRowClick?: (data: Row<T>, event?: React.MouseEvent) => void,
    handleRowClick?: (data: Row<T>, field?:string, event?: React.MouseEvent) => void,
    onSelectionChange?: (selectedRows: T[]) => void, // 用於讓父元件知道被選取的資料
    selectable?: boolean,
    disableCondition?: (row: Row<T>) => boolean, // 自訂是否可選取條件
    tableData?: PageData<T>,
    query?: {},
    queryId?: number,//用以判斷是否要重新查詢
}
export interface DisplayTableProps<T> {//資料來源與API無關的table
    columnDef: ColumnDef<T, any>[],
    headerCss?: React.CSSProperties,
    bodyCss?: React.CSSProperties,
    handleRowClick?: (data: Row<T>, field?:string, event?: React.MouseEvent) => void,
    onSelectionChange?: (selectedRows: T[]) => void, // 用於讓父元件知道被選取的資料
    selectable?: boolean,
    tableData: T[],
}

export interface Permission {
    permissionId?: string;
    permissionName?: string;
    permissionNote?: string;
    no?: number;
}

export interface CssSize {
  height: string;
  width: string;
}
export interface PopUpDetail {
  //彈窗
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mustFocus: boolean;
  setFocus: React.Dispatch<React.SetStateAction<boolean>>;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  actionAfterClose: () => void;
  //原警示訊息
  openNotification: (msg: string, severity: string) => void;
  //loading畫面
  openMask: boolean;
  setOpenMask: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setWindowSize: React.Dispatch<React.SetStateAction<CssSize>>;
}
export interface StorageMethod {
    setItem: (key: StorageKey, value: string) => void;
    getItem: (key: StorageKey) => string | null;
    removeItem: (key: StorageKey) => void;
}
export interface AuthMethod {
  authData: AuthData;
  appLogin: (userId: string) => void;
  appLogout: () => void;
  authLogout: () => void;
}
export interface FhirStorage {
    fhirJson: string;
    setFhirJson: (json: string) => void;
    fullUrl: string;
    setFullUrl: (url: string) => void;
    fhirResource: FhirResource;
    setFhirResource: (type: FhirResource) => void;
}
export interface PopUpMethod {
    openPopUp: (msg: string, focus: boolean, size?:PopupSize, actionAfterClose?: ()=> void) => void;
    loading: (openMask: boolean, loading?: boolean) => void;
    openNotification: (msg: string, severity: string) => void;
}