// src/App.tsx
import { createSignal, createEffect, onMount } from 'solid-js';
import MapComponent from './components/MapComponent';
// import ThreeDView from './components/Ea';

function App() {
  // const [earthquakeData, setEarthquakeData] = createSignal([]);
  const [selectedAreaData, setSelectedAreaData] = createSignal([]);
  const [show3DView, setShow3DView] = createSignal(false);
  const [count, setCount] = createSignal(0);
  const [isDataLoaded, setIsDataLoaded] = createSignal(false);

  // // Fetch earthquake data from the USGS API
  // onMount(() => {
  //   fetch('https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=2014-01-02')
  //     .then(response => response.json())
  //     .then(data => {
  //       setEarthquakeData(data.features);
  //       setIsDataLoaded(true);
  //     });
  // });

  // Handle selected earthquakes based on user-drawn area

  // RADI
  const handleSelection = (selectedEarthquakes) => {
    setSelectedAreaData(selectedEarthquakes);
    // console.log(selectedAreaData);s
    console.log("selectedAreaData", selectedAreaData());
  };

  return (
    <div>

        <MapComponent
          onAreaSelect={handleSelection}
          onView3D={() => setShow3DView(true)}
        />


      {/* Optional: Render ThreeDView component */}
      {show3DView() && <ThreeDView />}
    </div>
  );
}

export default App;
