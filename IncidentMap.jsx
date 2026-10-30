
import { useState } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const colors = {
  Critical: '#fb7185',
  High: '#fbbf24',
  Medium: '#38bdf8',
  Low: '#34d399',
};

function LocationPicker({ onLocationSelect, onPick }) {
  useMapEvents({
    click(event) {
      const lat = Number(event.latlng.lat.toFixed(6));
      const lng = Number(event.latlng.lng.toFixed(6));

      onPick([lat, lng]);

      if (onLocationSelect) {
        onLocationSelect(lat, lng);
      }
    },
  });

  return null;
}

export default function IncidentMap({
  incidents = [],
  onLocationSelect,
}) {
  const [pickedLocation, setPickedLocation] = useState(null);

  const validIncidents = incidents.filter(
    (incident) =>
      Number.isFinite(Number(incident.lat)) &&
      Number.isFinite(Number(incident.lng)) &&
      incident.lat !== '' &&
      incident.lng !== ''
  );

  return (
    <div className="h-[180px] overflow-hidden rounded-xl border border-slate-700">
      <MapContainer
        center={[12.9352, 77.6245]}
        zoom={12}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationPicker
          onLocationSelect={onLocationSelect}
          onPick={setPickedLocation}
        />

        {validIncidents.map((incident) => {
          const color = colors[incident.priority] || '#38bdf8';

          return (
            <CircleMarker
              key={incident.id}
              center={[
                Number(incident.lat),
                Number(incident.lng),
              ]}
              radius={10}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Popup>
                <strong>{incident.title}</strong>
                <br />
                {incident.location || 'Location not provided'}
                <br />
                Priority: {incident.priority || 'Unknown'}
                <br />
                Status: {incident.status || 'Unknown'}
                <br />
                ID: {incident.id}
              </Popup>
            </CircleMarker>
          );
        })}

        {pickedLocation && (
          <CircleMarker
            center={pickedLocation}
            radius={8}
            pathOptions={{
              color: '#ffffff',
              fillColor: '#a78bfa',
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Popup>
              <strong>Selected SOS location</strong>
              <br />
              Latitude: {pickedLocation[0]}
              <br />
              Longitude: {pickedLocation[1]}
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}
