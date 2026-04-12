import React from 'react'
import Card from 'react-bootstrap/Card';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Polyline } from 'react-leaflet';
import { useMap } from 'react-leaflet';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const userIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [32, 32],
});

const correctIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
});

const designMode = false; // Set to true to enable design mode with hardcoded movie and location

const Guessr = () => {
    const [movie, setMovie] = React.useState("");
    const [results, setResult] = React.useState(null);
    const [position, setPosition] = React.useState(null);
    const [gameStarted, setGameStarted] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const startNewRound = async () => {
    await fetchRound();
    };

//~~~~~~~~~~~~grabs movie for the round when the page loads
    React.useEffect(() => {
    if (!gameStarted) return;
    fetchRound();
    }, [gameStarted]);

    const fetchRound = async () => {
        setLoading(true);
        setResult(null);
        setPosition(null);

        try {
            const endpoint = designMode
            ? 'http://localhost:8081/guessr/test'
            : 'http://localhost:8081/guessr/get';

            const res = await fetch(endpoint);
            const data = await res.json();
            setMovie(data);
            
        } catch (err) {
            console.error("Failed to load new round:", err);
        } finally {
            setLoading(false);
        }
    };

//~~~~~~~~~~~~disabled map interactions when guess is submitted to lock the map for answer reveal

const MapLock = ({ locked }) => {
    const map = useMap();
    React.useEffect(() => {
        if (locked) {
            map.dragging.disable();
            map.scrollWheelZoom.disable();
            map.doubleClickZoom.disable();
            map.boxZoom.disable();
            map.keyboard.disable();
            map.touchZoom.disable();
        } else {
            map.dragging.enable();
            map.scrollWheelZoom.enable();
            map.doubleClickZoom.enable();
            map.boxZoom.enable();
            map.keyboard.enable();
            map.touchZoom.enable();
        }
    }, [locked, map]);

    return null;
};

//~~~~~~~~~~~~~~~autozooms to map bounds after guess is submitted
const FitBounds = ({ position, results }) => {
  const map = useMap();

  React.useEffect(() => {
    if (position && results) {
      const bounds = [
        [position.lat, position.lng],
        [
          results.correctLocation.truelat,
          results.correctLocation.truelng
        ]
      ];
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [position, results, map]);

  return null;
};

//~~~~~~~~~~~~~handles map click events to get user's guess for location
const ClickHandler = () => {
    useMapEvents({
        click(e) {
        if (results) return; // Disable clicking after guess is submitted
        setPosition(e.latlng);
        },
    });
    return null;
};

//~~~~~~~~~~~~~~~~~~submits user guess to backend
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

    const truedata = await res.json();
    setResult(truedata);

    console.log("Submitted guess:", position);
    console.log(truedata);
};

//~~~~~~~~~~~~~~~~~~~~~~displays page~~~~~~~~~~~~~~~~~~~~~~~

if (!gameStarted) {
  return (
    <div className="text-center mt-5">
      <h1> Movie Guessr</h1>
      <p>Guess where the movie was most popular!</p>
      <button
        className="btn btn-primary"
        onClick={() => setGameStarted(true)}
      >
        Start Game
        {loading && <p>Loading new round...</p>}
      </button>
    </div>
  );
}
    return (
    <div className="guessr">

      <h1 className="mx-2">Guessr</h1>

    {/* Two-column layout: Map on left, Poster on right */}
    <div className="d-flex align-items-stretch">

    {/* Left: Map */}
    <MapContainer
    center={[20, 0]}
    zoom={2}
    style={{ height: "600px", width: "100%" }}
    minZoom={2}
    >
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

  <ClickHandler />
  <MapLock locked={!!results} />
  <FitBounds position={position} results={results} />

  {/* User marker */}
  {position && (
    <Marker position={position} icon={userIcon} />
  )}

  {/* Correct marker + line */}
  {results && (
    <>
      <Marker
        position={[
          results.correctLocation.truelat,
          results.correctLocation.truelng
        ]}
        icon={correctIcon}
      />

      <Polyline
        positions={[
          [position.lat, position.lng],
          [
            results.correctLocation.truelat,
            results.correctLocation.truelng
          ]
        ]}
      />
    </>
  )}
</MapContainer>


    {/* Right: Poster */}
    <div style={{ width: "400px", height: "600px" }}>

  {!results ? ( //~~~~~~~~~~~~~~~~~~~~~~ Before Submit ~~~~~~~~~~~~~~~~~~~
    movie && movie.poster && (
    <Card style={{ height: "100%" }}>
        <Card.Body className="text-center">
            <Card.Title>{movie.movie}</Card.Title>
        </Card.Body>

    <div style= {{flex: 1}}>
        <Card.Img
            src={movie.poster}
            style={{
            width: "100%",
            height: "90%",
            objectFit: "cover"
            }}
    />
  </div>
</Card>
    )
  ) : (
    // ~~~~~~~~~~~~~~~~~~~~ AFTER SUBMIT ~~~~~~~~~~~~~~~~~~
    <Card>
      <Card.Body className="text-center">
        <Card.Title>Results</Card.Title>
        <p>
          <strong>Answer:</strong> {results.answer || "Unknown"}
        </p>

        <p>
          <strong>Your Guess:</strong> {results.userGuess?.lat.toFixed(2)},{" "}
          {results.userGuess?.lng.toFixed(2)}
        </p>
        <p>
          <strong>Score:</strong> {results.score || 0}
        </p>
        <p>
            <strong>Coins Earned:</strong> {results.coins || 0}
        </p>
        <p> 
            Distance: {results.distance || "Unknown"} km
        </p>

      </Card.Body>
    </Card>
  )}

</div>

  </div>

      {/* 🎯 Submit Button */}
<div className="text-center mt-3">
  {!results ? (
    <button
      onClick={handleSubmission}
      className="btn btn-primary"
      disabled={!position || results}
    >
      Submit Guess
    </button>
  ) : (
    <button
      onClick={startNewRound}
      className="btn btn-success"
    >
      Next Round
    </button>
  )}
</div>
    </div>
  );
}

export default Guessr;