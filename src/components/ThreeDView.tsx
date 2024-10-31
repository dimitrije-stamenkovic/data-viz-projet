// src/components/MapComponent.jsx
import { createSignal, onMount } from 'solid-js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Earthquake3DView from './Earthquake3DView';

function MapComponent({ earthquakeData }) {
  let mapContainer: HTMLDivElement | undefined;
  const [map, setMap] = createSignal<L.Map>();
  const [isSelecting, setIsSelecting] = createSignal(false);
  const [selectionActive, setSelectionActive] = createSignal(false);
  const [selectedEarthquakes, setSelectedEarthquakes] = createSignal([]);
  const [show3DView, setShow3DView] = createSignal(false);

  let startPoint: L.LatLng | null = null;
  let selectionRectangle: L.Rectangle | null = null;

  onMount(() => {
    if (mapContainer && !map()) {
      const newMap = L.map(mapContainer).setView([0, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(newMap);
      setMap(newMap);

      plotEarthquakeData();
    }
  });

  function plotEarthquakeData() {
    const currentMap = map();
    if (currentMap) {
      currentMap.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.Rectangle) {
          currentMap.removeLayer(layer);
        }
      });

      earthquakeData.forEach((feature) => {
        const [longitude, latitude] = feature.geometry.coordinates;
        L.circleMarker([latitude, longitude], {
          radius: 5,
          fillColor: "#f03",
          color: "#f03",
          fillOpacity: 0.5,
        }).addTo(currentMap);
      });
    }
  }

  function selectArea() {
    if (selectionActive()) {
      resetSelection();
    } else {
      const currentMap = map();
      if (currentMap) {
        setIsSelecting(true);
        currentMap.dragging.disable();
        currentMap.getContainer().style.cursor = 'crosshair';

        currentMap.on('mousedown', onMouseDown);
        currentMap.on('mousemove', onMouseMove);
        currentMap.on('mouseup', onMouseUp);
      }
    }
  }

  function onMouseDown(e: L.LeafletMouseEvent) {
    startPoint = e.latlng;
    if (selectionRectangle) {
      selectionRectangle.remove();
    }
  }

  function onMouseMove(e: L.LeafletMouseEvent) {
    const currentMap = map();
    if (startPoint && currentMap) {
      const bounds = L.latLngBounds(startPoint, e.latlng);

      if (!selectionRectangle) {
        selectionRectangle = L.rectangle(bounds, { color: "#3388ff", weight: 1 });
        selectionRectangle.addTo(currentMap);
      } else {
        selectionRectangle.setBounds(bounds);
      }
    }
  }

  function onMouseUp() {
    const currentMap = map();
    if (currentMap) {
      currentMap.dragging.enable();
      currentMap.getContainer().style.cursor = '';

      currentMap.off('mousedown', onMouseDown);
      currentMap.off('mousemove', onMouseMove);
      currentMap.off('mouseup', onMouseUp);

      setSelectionActive(true);
      startPoint = null;
    }
  }

  function resetSelection() {
    if (selectionRectangle) {
      selectionRectangle.remove();
      selectionRectangle = null;
    }
    setSelectedEarthquakes([]);
    setSelectionActive(false);
  }

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {!show3DView() && (
        <>
          <div ref={mapContainer} style={{ height: 'calc(100% - 40px)', width: '100%' }} />
          <div className="button-container">
            <button onClick={selectArea}>
              {selectionActive() ? "Reset Selection" : "Select Area"}
            </button>
            <button onClick={() => setShow3DView(true)}>Open in 3D</button>
          </div>

          {selectedEarthquakes()?.length > 0 && (
            <div className="selection-info">
              Selected Earthquakes: {selectedEarthquakes()?.length}
            </div>
          )}
        </>
      )}

      {show3DView() && (
        <Earthquake3DView earthquakes={selectedEarthquakes()} onClose={() => setShow3DView(false)} />
      )}
    </div>
  );
}

export default MapComponent;
