import React from 'react'
import Card from 'react-bootstrap/Card';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const designMode = true; // Set to true to enable design mode with hardcoded movie and location

const Guessr = () => {
    const [movie, setMovie] = React.useState("");
    const [result, setResult] = React.useState(null);
    const [position, setPosition] = React.useState(null);

        //grabs movie for the round when the page loads
    React.useEffect(() => {

        const fetchRound = async () => {
            try {
                if (!designMode) {
                    const res = await fetch('http://localhost:8081/guessr/get');
                    const data = await res.json();
                        console.log(data);
                    setMovie(data);

                } else {
                    const res = await fetch('http://localhost:8081/guessr/test');
                    const data = await res.json();
                        console.log(data);
                    setMovie(data);
                }

            } catch (err) {
                console.error("Failed to load round:", err);
            }
        };

    fetchRound();
    }, []);

    //handles map click events to get user's guess for location
    const ClickHandler = () => {
    useMapEvents({
        click(e) {
        setPosition(e.latlng);
        },
    });
    return null;
    };

    //submits user guess to backend
    const handleSubmission = async () => {
        if (!position) return;

    const res = await fetch('http://localhost:8081/guessr/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        lat: position.lat,
        lng: position.lng
        })
    });

    const data = await res.json();
    setResult(data);
    };

//~~~~~~~~~~~~~~~~~~~~~~displays page~~~~~~~~~~~~~~~~~~~~~~~
    return (
    <div className="guessr">

      <h1 className="mx-2">Guessr</h1>

    {/* Two-column layout: Map on left, Poster on right */}
    <div className="d-flex justify-content-between align-items-start">
    
    {/* Left: Map */}
    <div style={{ flex: 1, marginRight: "1rem" }}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "600px", width: "100%" }}
        minZoom={2}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler />
        {position && <Marker position={position} />}
      </MapContainer>
    </div>

    {/* Right: Poster */}
    <div style={{ width: "400px", flexShrink: 0 }}>
      {movie && movie.poster && (
        <Card>
          <Card.Img variant="top" src={movie.poster} alt={`${movie.movie} poster`} />
        </Card>
      )}
    </div>

  </div>

      {/* 🎯 Submit Button */}
      <div className="text-center mt-3">
        <button onClick={handleSubmission} className="btn btn-primary">
          Submit
        </button>
      </div>
    </div>
  );
};

export default Guessr;