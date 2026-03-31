import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IGeofenceConfig extends Document {
  organizationId?: Types.ObjectId | null;
  center: { lat: number; lng: number };
  radiusMeters: number;
  enabled: boolean;
  /** Identificador externo (integração / gráficos). */
  idGraf?: string | null;
  updatedAt: Date;
}

const geofenceSchema = new Schema<IGeofenceConfig>(
  {
    organizationId: { type: Schema.Types.ObjectId, default: null },
    center: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    radiusMeters: { type: Number, required: true, min: 10, max: 50000 },
    enabled: { type: Boolean, default: false },
    idGraf: { type: String, default: null, maxlength: 256 },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const GeofenceConfigModel = mongoose.model<IGeofenceConfig>(
  'GeofenceConfig',
  geofenceSchema
);
