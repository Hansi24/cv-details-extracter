import { Request, Response, NextFunction } from 'express';

export namespace Util {
    // Utility function to handle async errors
    export function withErrorHandling(
        requestHandler: (req: Request, res: Response, next: NextFunction) => Promise<any>
    ) {
        return function (req: Request, res: Response, next: NextFunction) {
            // Execute the request handler and catch any unhandled errors
            requestHandler(req, res, next).catch(next);
        };
    }

    export function sendSuccess(res: Response, data: any, message: string|null = null): void {
        res.send({ success: true, data, message });
    }
    export function sendError(res: Response, error: any, errorCode = 0): void {
        if (typeof error === 'string') {
            res.send({ success: false, error, errorCode });
        } else {
            if (!error) {
                error = { stack: null, message: "Unknown Error" };
            }
            res.send({ success: false, error: error.message, errorData: error, errorCode });
        }
    }
}
