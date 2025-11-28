
export class NotLoginError extends Error {
    constructor() {
        super("Not logged in");
        this.name = "NotLoginError";
    }
}

export class TokenExpiredError extends Error {
    constructor() {
        super("Token expired");
        this.name = "TokenExpiredError";
    }
}