// src/components/MapComponent.jsx
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function MapComponent({ onAreaSelect, isSelecting, toggleSelection }) {
  let mapContainer;
  const [map, setMap] = createSignal();
  const [fetchedEarthquakes, setEarthquakes] = createSignal([]);
  const [selectionRectangle, setSelectionRectangle] = createSignal(null);
  let startPoint = null;

  onMount(() => {
    if (mapContainer && !map()) {
      const newMap = L.map(mapContainer).setView([0, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(newMap);
      setMap(newMap);

      fetchEarthquakeData();

      newMap.on('mousedown', startSelection);
      newMap.on("mousemove", inProgressSelection);
      newMap.on("mouseup", endSelection);
    }
  });

  async function fetchEarthquakeData() {
    try {
      const response = await fetch('https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=2014-01-02');
      const data = await response.json();
      setEarthquakes(data.features);
      plotEarthquakeData();
    } catch (error) {
      console.error("Error fetching earthquake data:", error);
    }
  }

  function plotEarthquakeData() {
    const currentMap = map();
    if (currentMap) {
      currentMap.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.Rectangle) {
          currentMap.removeLayer(layer);
        }
      });

      fetchedEarthquakes().forEach((feature) => {
        const [longitude, latitude] = feature.geometry.coordinates;
        L.circleMarker([latitude, longitude], {
          radius: 5,
          fillColor: "#b84f2f",
          color: "#b84f2f",
          fillOpacity: 0.5,
        }).addTo(currentMap);
      });
    }
  }

  function startSelection(e) {
    startPoint = e.latlng;
  }

  function inProgressSelection(e) {
    if (!startPoint) return;

    const bounds = L.latLngBounds(startPoint, e.latlng);
    if (selectionRectangle()) {
      selectionRectangle().setBounds(bounds);
    } else {
      setSelectionRectangle(L.rectangle(bounds, { color: "#3388ff", weight: 1, interactive: false }));
      selectionRectangle().addTo(map());
    }
  }

  function endSelection() {
    if (selectionRectangle()) {
      const bounds = selectionRectangle().getBounds();
      console.log("Selected bounds:", bounds);
    }

    startPoint = null;
    selectionRectangle(null);
  }

  createEffect(() => {
    if (isSelecting()) {
      map().dragging.disable();
      map().getContainer().style.cursor = 'crosshair';
    } else {
      map().dragging.enable();
      map().getContainer().style.cursor = '';
    }
  });

  return (
      <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
        <div ref={mapContainer} style={{ height: 'calc(100% - 40px)', width: '100%' }} />
        {/*{selectedEarthquakes()?.length > 0 && (*/}
        {/*    <div className="selection-info">*/}
        {/*      Selected Earthquakes: {selectedEarthquakes()?.length}*/}
        {/*    </div>*/}
        {/*)}*/}
      </div>
  );
}

export default MapComponent;
