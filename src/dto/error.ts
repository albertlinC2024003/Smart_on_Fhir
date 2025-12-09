
export class NotLoginError extends Error {
    constructor(msg: string = "尚未登入") {
        super(msg);
        this.name = "NotLoginError";
    }
}

export class TokenExpiredError extends Error {
    constructor(msg: string = "登入逾期，請重新登入") {
        super(msg);
        this.name = "TokenExpiredError";
    }
}
export class NoPermissionError extends Error {
    constructor(msg: string = "權限不足，無法執行此操作") {
        super(msg);
        this.name = "NoPermissionError";
    }
}