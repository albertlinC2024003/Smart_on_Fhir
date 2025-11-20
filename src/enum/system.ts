export enum AuthStatus {
  Auth_Loading,
  Auth_SignedIn,
  Auth_SignedOut,
}

export enum StorageKey{
  csrf = 'csrf',
  userId = 'userId',
}

export enum PermissionId {
    NULL = undefined,
    CLOUD = 'Cloud',
}