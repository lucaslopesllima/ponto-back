import { Types } from 'mongoose';
import { type PunchKindValue } from '../models/time-entry.model.js';
export declare function createManualPunchRequest(userId: string, timeZone: string, input: {
    timestamp: string;
    reason: string;
}): Promise<{
    id: string;
    timestamp: Date;
    type: PunchKindValue;
    status: import("../models/manual-punch-request.model.js").ManualPunchRequestStatusValue;
}>;
export declare function listMyManualPunchRequests(userId: string): Promise<(import("mongoose").FlattenMaps<import("../models/manual-punch-request.model.js").IManualPunchRequest> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
})[]>;
/** `limit` 0 = sem paginação (retorna todos). */
export declare function listPendingManualPunchRequests(adminId: string, opts: {
    page: number;
    limit: number;
}): Promise<{
    items: (import("mongoose").FlattenMaps<import("../models/manual-punch-request.model.js").IManualPunchRequest> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}>;
export declare function decideManualPunchRequest(adminId: string, requestId: string, approve: boolean): Promise<import("mongoose").Document<unknown, {}, import("../models/manual-punch-request.model.js").IManualPunchRequest, {}, {}> & import("../models/manual-punch-request.model.js").IManualPunchRequest & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
//# sourceMappingURL=manual-punch-request.service.d.ts.map