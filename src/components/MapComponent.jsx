// src/components/MapComponent.jsx
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function MapComponent({ onAreaSelect, isSelecting }) {
  let mapContainer;
  const [map, setMap] = createSignal();
  const [fetchedEarthquakes, setEarthquakes] = createSignal([]);
  const [selectionRectangle, setSelectionRectangle] = createSignal(null);
  let startPoint = null;

  onMount(() => {
    if (mapContainer && !map()) {
      const newMap = L.map(mapContainer, { zoomControl: false }).setView([0, 0], 2);
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }).addTo(newMap);

      // L.tileLayer.here({ apiKey: 'abcde' }).addTo(newMap);


      L.control.zoom({
        position: 'bottomright'
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
          fillColor: "#5fc5dd",
          color: "#2fb836",
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

    let latDiff = Math.abs(startPoint.lat - e.latlng.lat);
    let lngDiff = Math.abs(startPoint.lng - e.latlng.lng);

    // Define maximum and aspect ratio limits
    const maxLatDiff = 20;
    const maxLngDiff = 40;
    const aspectRatio = 1 / 2; // Height to width ratio of 1:2

    // Apply max limits
    latDiff = Math.min(latDiff, maxLatDiff);
    lngDiff = Math.min(lngDiff, maxLngDiff);

    // Adjust differences to maintain aspect ratio
    if (latDiff / lngDiff > aspectRatio) {
      // If latDiff is too large relative to lngDiff, adjust it
      latDiff = lngDiff * aspectRatio;
    } else {
      // If lngDiff is too large relative to latDiff, adjust it
      lngDiff = latDiff / aspectRatio;
    }

    // Create adjusted LatLng based on the limited and aspect ratio-constrained differences
    const adjustedLatLng = L.latLng(
        startPoint.lat + (e.latlng.lat > startPoint.lat ? latDiff : -latDiff),
        startPoint.lng + (e.latlng.lng > startPoint.lng ? lngDiff : -lngDiff)
    );

    const bounds = L.latLngBounds(startPoint, adjustedLatLng);
    console.log("Latitude Difference:", latDiff, "Longitude Difference:", lngDiff);

    if (selectionRectangle()) {
      selectionRectangle().setBounds(bounds);
    } else {
      setSelectionRectangle(L.rectangle(bounds, { color: "#3388ff", weight: 1, interactive: false }));
      selectionRectangle().addTo(map());
    }
  }



  // function endSelection() {
  //   if (selectionRectangle()) {
  //     const bounds = selectionRectangle().getBounds();
  //     console.log("Selected bounds:", bounds);
  //   }
  //
  //   startPoint = null;
  //   selectionRectangle(null);
  // }


  function endSelection() {
    if (selectionRectangle()) {
      const bounds = selectionRectangle().getBounds();
      console.log("Selected bounds:", bounds);

      // Filter earthquakes within the selected bounds
      const selectedEarthquakes = fetchedEarthquakes().filter(feature => {
        const [lng, lat] = feature.geometry.coordinates;
        return bounds.contains(L.latLng(lat, lng));
      });
      // Call onAreaSelect with the selected earthquakes
      onAreaSelect(selectedEarthquakes);
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
        <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
        {/*{selectedEarthquakes()?.length > 0 && (*/}
        {/*    <div className="selection-info">*/}
        {/*      Selected Earthquakes: {selectedEarthquakes()?.length}*/}
        {/*    </div>*/}
        {/*)}*/}
      </div>
  );
}

export default MapComponent;
