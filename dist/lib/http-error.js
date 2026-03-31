export class HttpError extends Error {
    statusCode;
    code;
    constructor(statusCode, message, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'HttpError';
    }
}
//# sourceMappingURL=http-error.js.map