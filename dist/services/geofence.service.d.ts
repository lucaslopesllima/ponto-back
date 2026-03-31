export declare function assertLocationAllowed(lat: number, lng: number): Promise<void>;
export declare function getGeofenceConfig(): Promise<(import("mongoose").FlattenMaps<import("../models/geofence.model.js").IGeofenceConfig> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | {
    center: {
        lat: number;
        lng: number;
    };
    radiusMeters: number;
    enabled: false;
}>;
export declare function upsertGeofence(input: {
    center: {
        lat: number;
        lng: number;
    };
    radiusMeters: number;
    enabled: boolean;
}): Promise<void>;
//# sourceMappingURL=geofence.service.d.ts.map