import {useContext, createContext, type ReactNode} from "react";
import type {AuthData} from "../../dto/dataObj.ts";
import { useProvider } from "../ComponentProvider";
import { AuthStatus, StorageKey } from "../../enum/system";
import { localS, sessionS } from "./ProjectStorage";
const AuthContext = createContext<AuthData>({ status: AuthStatus.Auth_Loading });
export const useAuth = () => {
  const authData = useContext(AuthContext);
  if (!authData) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  const authLogin = (userId: string) => {
    authData.status = AuthStatus.Auth_SignedIn;
    authData.userId = userId;
    localS.setItem(StorageKey.userId, userId);
  }
  const authLogout = () => { 
    authData.status = AuthStatus.Auth_SignedOut;
    authData.userId = '未登入';
    localS.removeItem(StorageKey.userId);
    sessionS.removeItem(StorageKey.csrf);
  }
  return { authData, authLogin, authLogout };
};

const AuthProvider = ({ children }:{ children: ReactNode }) => {
  const {authData, authLogin, authLogout} = useAuth();
  const { localStorage, sessionStorage } = useProvider();
  const token = sessionStorage.getItem(StorageKey.csrf);
  const userId = localStorage.getItem(StorageKey.userId);
  if (token !== null && userId !== null) {
    authLogin(userId);
  } else {
    authLogout();
  }
  return <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>;
};
export default AuthProvider;