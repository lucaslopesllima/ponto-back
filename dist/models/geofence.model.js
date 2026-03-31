import mongoose, { Schema } from 'mongoose';
const geofenceSchema = new Schema({
    organizationId: { type: Schema.Types.ObjectId, default: null },
    center: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    radiusMeters: { type: Number, required: true, min: 10, max: 50000 },
    enabled: { type: Boolean, default: false },
    idGraf: { type: String, default: null, maxlength: 256 },
}, { timestamps: { createdAt: false, updatedAt: true } });
export const GeofenceConfigModel = mongoose.model('GeofenceConfig', geofenceSchema);
//# sourceMappingURL=geofence.model.js.map