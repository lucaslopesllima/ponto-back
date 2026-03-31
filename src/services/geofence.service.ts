import { GeofenceConfigModel } from '../models/geofence.model.js';
import { haversineMeters } from '../lib/geo.js';
import { HttpError } from '../lib/http-error.js';

export async function assertLocationAllowed(lat: number, lng: number): Promise<void> {
  const doc = await GeofenceConfigModel.findOne().sort({ updatedAt: -1 }).lean();
  if (!doc || !doc.enabled) return;
  const d = haversineMeters(lat, lng, doc.center.lat, doc.center.lng);
  if (d > doc.radiusMeters) {
    throw new HttpError(
      403,
      'Registro fora da área permitida. Aproxime-se do local autorizado.',
      'GEOFENCE'
    );
  }
}

export async function getGeofenceConfig() {
  const doc = await GeofenceConfigModel.findOne().sort({ updatedAt: -1 }).lean();
  return (
    doc ?? {
      center: { lat: -23.5505, lng: -46.6333 },
      radiusMeters: 500,
      enabled: false,
    }
  );
}

export async function upsertGeofence(input: {
  center: { lat: number; lng: number };
  radiusMeters: number;
  enabled: boolean;
}) {
  await GeofenceConfigModel.findOneAndUpdate(
    {},
    {
      $set: {
        center: input.center,
        radiusMeters: input.radiusMeters,
        enabled: input.enabled,
      },
    },
    { upsert: true, new: true }
  );
}
