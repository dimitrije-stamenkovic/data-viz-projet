import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {latLngBounds} from "leaflet/src/geo";

function MapComponent({ onAreaSelect }) {
  let mapContainer;
  const [map, setMap] = createSignal();
  const [isSelecting, setIsSelecting] = createSignal(false);
  const [fetchedEarthquakes, setEarthquakes] = createSignal([]);
  const [selectedEarthquakes, setSelectedEarthquakes] = createSignal([]);
  const [selectionBounds, setSelectionBounds] = createSignal(null);
  const [selectionRectangle,setSelectionRectangle] = createSignal(null);

  let startPoint = null;
  // let selectionRectangle = null;



  // Initialize the Leaflet map and set up events
  onMount(() => {
    if (mapContainer && !map()) {
      const newMap = L.map(mapContainer).setView([0, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(newMap);
      setMap(newMap);

      fetchEarthquakeData();

      // Attach event listeners
      newMap.on('mousedown', startSelection);//click
      newMap.on("mousemove",inProgressSelection)
      newMap.on("mouseup",endSelection);
      // onCleanup(() => {
      //   newMap.off('click', onMapClick);
      // });
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
      // Clear existing markers
      currentMap.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.Rectangle) {
          currentMap.removeLayer(layer);
        }
      });

      // Add earthquake markers
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

    // if (selectionRectangle()) {
    //   // Remove any existing selection rectangle
    //   selectionRectangle().remove();
    //   selectionRectangle(null);
    // }

    // Disable dragging while selecting
    // map().dragging.disable();
    // map().getContainer().style.cursor = 'crosshair';
  }

  function inProgressSelection(e) {
    if (!startPoint) return;

    const bounds = L.latLngBounds(startPoint, e.latlng);
    // If selectionRectangle exists, update bounds; otherwise, create it
    if (selectionRectangle()) {
      selectionRectangle().setBounds(bounds);
    } else {
      setSelectionRectangle(L.rectangle(bounds, { color: "#3388ff", weight: 1 ,interactive:false}))
      selectionRectangle().addTo(map());
    }
  }

  function endSelection(e) {
    if (selectionRectangle()) {
      const bounds = selectionRectangle().getBounds();
      console.log("Selected bounds:", bounds);

      // Optionally, handle the selection of features within the bounds here
      // Example: selectFeaturesWithinBounds(bounds);
    }

    // Reset startPoint for next selection
    startPoint = null;
    selectionRectangle(null);
  }
  // function selectArea() {
  //   if (selectionActive()) {
  //     resetSelection();
  //   } else {
  //     const currentMap = map();
  //     if (currentMap) {
  //       setIsSelecting(true);
  //       currentMap.dragging.disable();
  //       currentMap.getContainer().style.cursor = 'crosshair';
  //
  //       // Attach selection events and cleanup on unmount
  //       currentMap.on('mousedown', onMouseDown);
  //       currentMap.on('mousemove', onMouseMove);
  //       currentMap.on('mouseup', onMouseUp);
  //
  //       onCleanup(() => {
  //         currentMap.off('mousedown', onMouseDown);
  //         currentMap.off('mousemove', onMouseMove);
  //         currentMap.off('mouseup', onMouseUp);
  //       });
  //     }
  //   }
  // }
  //
  // function onMouseDown(e) {
  //   startPoint = e.latlng;
  //   if (selectionRectangle) {
  //     selectionRectangle.remove();
  //   }
  // }
  //
  // function onMouseMove(e) {
  //   const currentMap = map();
  //   if (startPoint && currentMap) {
  //     const bounds = L.latLngBounds(startPoint, e.latlng);
  //
  //     if (!selectionRectangle) {
  //       selectionRectangle = L.rectangle(bounds, { color: "#3388ff", weight: 1 });
  //       selectionRectangle.addTo(currentMap);
  //     } else {
  //       selectionRectangle.setBounds(bounds);
  //     }
  //
  //     setSelectionBounds(bounds);
  //   }
  // }
  //
  // function onMouseUp() {
  //   const currentMap = map();
  //   if (currentMap) {
  //     currentMap.dragging.enable();
  //     currentMap.getContainer().style.cursor = '';
  //
  //     if (selectionBounds()) {
  //       selectEarthquakesInBounds(selectionBounds());
  //       setSelectionActive(true);
  //     }
  //
  //     setIsSelecting(false);
  //     startPoint = null;
  //   }
  // }
  //
  // function selectEarthquakesInBounds(bounds) {
  //   const selected = fetchedEarthquakes().filter((feature) => {
  //     const [longitude, latitude] = feature.geometry.coordinates;
  //     return bounds.contains(L.latLng(latitude, longitude));
  //   });
  //   setSelectedEarthquakes(selected);
  //   onAreaSelect(selected);
  // }
  //
  // function resetSelection() {
  //   if (selectionRectangle) {
  //     selectionRectangle.remove();
  //     selectionRectangle = null;
  //   }
  //   setSelectedEarthquakes([]);
  //   setSelectionBounds(null);
  //   setSelectionActive(false);
  // }

  function selectButtonHandler(){
    setIsSelecting(!isSelecting());
    if(isSelecting()==true){
      map().dragging.disable()
      map().getContainer().style.cursor = 'crosshair';
    }else{
      map().dragging.enable();
      map().getContainer().style.cursor = '';
    }

  }

  return (
      <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
        <div ref={mapContainer} style={{ height: 'calc(100% - 40px)', width: '100%' }} />
        <div className="button-container">
          <button onClick={selectButtonHandler}>
            {isSelecting() ? "Reset Selection" : "Select Area"}
          </button>
          <button onClick={() => console.log("View 3D clicked")}>View 3D</button>
        </div>

        {/* Display selected earthquakes count */}
        {selectedEarthquakes()?.length > 0 && (
            <div className="selection-info">
              Selected Earthquakes: {selectedEarthquakes()?.length}
            </div>
        )}
      </div>
  );
}

export default MapComponent;
