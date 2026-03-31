import { Types } from 'mongoose';
import { type AdjustmentKindValue } from '../models/adjustment.model.js';
export declare function createAdjustmentRequest(userId: string, input: {
    date: string;
    kind: AdjustmentKindValue;
    reason: string;
    proposedChanges?: {
        entrada1?: string | null;
        saida1?: string | null;
        entrada2?: string | null;
        saida2?: string | null;
    };
}): Promise<import("mongoose").Document<unknown, {}, import("../models/adjustment.model.js").IAdjustment, {}, {}> & import("../models/adjustment.model.js").IAdjustment & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
export declare function listMyAdjustments(userId: string): Promise<(import("mongoose").FlattenMaps<import("../models/adjustment.model.js").IAdjustment> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
})[]>;
/** `limit` 0 = sem paginação (retorna todos). */
export declare function listPendingAdjustments(adminId: string, opts: {
    page: number;
    limit: number;
}): Promise<{
    items: (import("mongoose").FlattenMaps<import("../models/adjustment.model.js").IAdjustment> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}>;
export declare function decideAdjustment(adminId: string, adjustmentId: string, approve: boolean): Promise<import("mongoose").Document<unknown, {}, import("../models/adjustment.model.js").IAdjustment, {}, {}> & import("../models/adjustment.model.js").IAdjustment & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
export declare function assertAdmin(userId: string): Promise<void>;
//# sourceMappingURL=adjustment.service.d.ts.map