import mongoose, { type Document, type Types } from 'mongoose';
export interface IGeofenceConfig extends Document {
    organizationId?: Types.ObjectId | null;
    center: {
        lat: number;
        lng: number;
    };
    radiusMeters: number;
    enabled: boolean;
    /** Identificador externo (integração / gráficos). */
    idGraf?: string | null;
    updatedAt: Date;
}
export declare const GeofenceConfigModel: mongoose.Model<IGeofenceConfig, {}, {}, {}, mongoose.Document<unknown, {}, IGeofenceConfig, {}, {}> & IGeofenceConfig & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=geofence.model.d.ts.map