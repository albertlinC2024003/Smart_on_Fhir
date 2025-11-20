
export interface ResponseData<T>{
    msg?:string,
    code?:number,
    success?:boolean,
    data?:T,
}

export interface PageData<T> extends ResponseData<T[]>{
    totalPages?: number,
    totalCount?: number
}
export interface Page {
    page?: number
    size?: number
}

export interface ReqUser extends Page {
  userId?: string
  username?: string
  active?: boolean
  mail?: string
  pwd?: string
  pwdCheck?: string
  permissions?: string[]
}
