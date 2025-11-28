export enum AuthStatus {
  Auth_Loading,
  Auth_SignedIn,
  Auth_SignedOut,
}

export enum StorageKey{
  csrf = 'csrf',
  userId = 'userId',
  pkce = 'pkce',
  accessToken = 'accessToken',
  refreshToken = 'refreshToken',
  idToken = 'idToken',
}

export enum PermissionId {
    NULL = undefined,
    CLOUD = 'Cloud',
}