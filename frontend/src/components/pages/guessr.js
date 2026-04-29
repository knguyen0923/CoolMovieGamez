import React from 'react'
import Card from 'react-bootstrap/Card';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../../css/guessr.css';
import getUserInfo from "../../utilities/decodeJwt"; //used to get profile info for submission to backend
import useHiloButtonSound from "../../utilities/useHiloButtonSound";

import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Polyline } from 'react-leaflet';
import { useMap } from 'react-leaflet';
import API_BASE from "../../config";
delete L.Icon.Default.prototype._getIconUrl;

const GUESSR_SUBMIT_SOUND_PATH = '/sounds/506053__mellau__button-click-2.wav';

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
const ROUND_TIME = 30;

const Guessr = () => {
    const [movie, setMovie] = React.useState("");
    const [results, setResult] = React.useState(null);
    const [position, setPosition] = React.useState(null);
    const [gameStarted, setGameStarted] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const [timeLeft, setTimeLeft] = React.useState(ROUND_TIME);
    const [totalScore, setTotalScore] = React.useState(0);
    const [round, setRound] = React.useState(1);
    const [user, setUser] = React.useState(null);

    const timerRef = React.useRef(null);
    const timeLeftRef  = React.useRef(ROUND_TIME);
    const hasSubmittedRef = React.useRef(false);
    const roundIdRef = React.useRef(null);
    const positionRef  = React.useRef(null);
    const playButtonSound = useHiloButtonSound();
    const playSubmitSound = useHiloButtonSound({
      soundPath: GUESSR_SUBMIT_SOUND_PATH,
      volume: 0.45,
      errorLabel: 'Guessr submit sound',
    });

    const username = user?.username || "Guest";

    React.useEffect(() => {
      const userInfo = getUserInfo();
      setUser(userInfo);
    }, []);

    React.useEffect(() => {
      return () => clearInterval(timerRef.current);
    }, []);

    React.useEffect(() => {
      positionRef.current = position;
    }, [position]);

    const startNewRound = async () => {
    playButtonSound();
    await fetchRound();
    };

//~~~~~~~~~~~~grabs movie for the round when the page loads
    React.useEffect(() => {
    if (!gameStarted) return;
    fetchRound();
    }, [gameStarted]);

    const fetchRound = async () => {
        clearInterval(timerRef.current);
        timerRef.current = null;
        
      hasSubmittedRef.current = false;
        
        setLoading(true);
        setResult(null);
        setPosition(null);

        try {
            const endpoint = designMode
            ? `${API_BASE}/guessr/test`
            : `${API_BASE}/guessr/get`;

            const res = await fetch(endpoint);
            if (!res.ok) {
              const text = await res.text();
              console.error("Server error:", text);
              throw new Error("Failed request");
            }
            const data = await res.json();
            setMovie(data);
            roundIdRef.current = data.roundId;
            startTimer();

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

//~~~~~~~~~~~~~~timer for submission~~~~~~~~~~~~~~~~
const startTimer = () => {
  clearInterval(timerRef.current);

  timeLeftRef.current = ROUND_TIME;
  setTimeLeft(ROUND_TIME);

timerRef.current = setInterval(() => {
  timeLeftRef.current -= 1;

  if (timeLeftRef.current <= 0) {
    clearInterval(timerRef.current);
    timerRef.current = null;
    console.log("AUTO SUBMIT FIRED");
    setTimeLeft(0);
    handleSubmission(true);
    return;
  }

  setTimeLeft(timeLeftRef.current);
}, 1000);
};



//~~~~~~~~~~~~~~~autozooms to map bounds after guess is submitted
const FitBounds = ({ position, results }) => {
  const map = useMap();

  React.useEffect(() => {
    if (position && results) {
      const bounds = [
        [position.lat, position.lng],
        [
          results.answer.lat,
          results.answer.lng
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
        setPosition({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });        
          console.log("Map clicked at:", e.latlng, "Lat:", e.latlng.lat, "Lng:", e.latlng.lng);
        },
    });
    return null;
};

//~~~~~~~~~~~~~~~~~~submits user guess to backend
const handleSubmission = async (isAuto = false) => {
  if (hasSubmittedRef.current) return;
  hasSubmittedRef.current = true;

  clearInterval(timerRef.current);
  timerRef.current = null;

  const currentPosition = positionRef.current;
  const lat = isAuto ? null : currentPosition?.lat;
  const lng = isAuto ? null : currentPosition?.lng;
  

  console.log("Check 1", { position, "Timer": timeLeft });
  console.log("SENDING:", { lat, lng, isAuto });
    const res = await fetch(`${API_BASE}/guessr/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        
        username: username,
        lat,
        lng,
        timer: timeLeftRef.current,
        roundId: roundIdRef.current,
        timedOut: isAuto,
        })
    });
    const truedata = await res.json();
    setResult(truedata);

    console.log("Check 3: Received response from server", truedata);

    setTotalScore(prev => prev + truedata.score);
    setRound(prev => prev + 1);
    window.dispatchEvent(new Event("coinsUpdated"));

    console.log("Submitted guess:", position);
    console.log(truedata);
};

//~~~~~~~~~~~~~~~~~~~~~~displays page~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

if (!gameStarted) {
  return (
    <div className="text-center mt-5">
      <h1> Movie Guessr</h1>
      <p>Guess where the movie takes place!</p>
      <button
        className="btn btn-primary"
        onClick={() => {
          playButtonSound();
          setGameStarted(true);
        }}
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
  {results?.answer && (
    <>
      <Marker
        position={[
          results.answer.lat, 
          results.answer.lng
        ]}
        icon={correctIcon}
      />
    {results?.answer && position && (
      <Polyline
        positions={[
          [position.lat, position.lng],
          [
            results.answer.lat,
            results.answer.lng
          ]
        ]}
      />
    )}
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
            <h5 style={{ color: timeLeft < 6 ? "red" : "grey" }}>
              Time Left: {timeLeft}s
            </h5>
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
        {results.timedOut && (
          <p style={{ color: "red", fontWeight: "bold" }}>
            TIME'S UP!
          </p>
        )}

        <p>
          <strong>Answer:</strong> {results.answer?.city || "Unknown"}
        </p>

        <p>
          <strong>Your Guess:</strong> {results.userGuess
  ? `${results.userGuess.lat.toFixed(2)}, ${results.userGuess.lng.toFixed(2)}`
  : "No guess"}
        </p>
        <p>
          <strong>Score:</strong> {results.score || 0}
        </p>
        <p>
            <strong>Coins Earned:</strong> {results.coins || 0}
        </p>
        <p> 
            Distance: {results.distance ?? "Unknown"} km
        </p>        
        <p> 
            TIMER BONUS: {results.timerbonus}
        </p>
        <p> 
            Total Score: {totalScore} | Round: {round}
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
      onClick={() => {
        playSubmitSound();
        handleSubmission(false);
      }}
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
