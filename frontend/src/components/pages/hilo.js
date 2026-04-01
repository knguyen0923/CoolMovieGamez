import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

// base url for the backend stuff
const API_BASE = 'http://localhost:8081';



// all css for this page gets dumped in here

const hiloStyles = `
    .hilo-page {
        min-height: 100vh;
        padding: 32px 16px 48px;
        background: #f5f7fb;
        color: #1f2937;
    }

    .hilo-page-active {
        padding: 0;
    }

    .app.dark .hilo-page {
        background: #111827;
        color: #f3f4f6;
    }

    .hilo-shell {
        max-width: 1100px;
        margin: 0 auto;
    }

    .hilo-shell-active {
        max-width: none;
        min-height: 100vh;
        padding: 18px 20px 24px;
        display: flex;
        flex-direction: column;
    }

    .hilo-hero {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;
        margin-bottom: 20px;
    }

    .hilo-eyebrow {
        margin: 0 0 10px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.75rem;
        color: #64748b;
        font-weight: 700;
    }

    .hilo-title {
        margin: 0;
        font-size: clamp(2.3rem, 6vw, 3.6rem);
        line-height: 1;
    }

    .hilo-subtitle {
        max-width: 620px;
        margin: 14px 0 0;
        font-size: 1rem;
        line-height: 1.6;
        color: #4b5563;
    }

    .app.dark .hilo-subtitle {
        color: #cbd5e1;
    }

    .hilo-scoreboard {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        justify-content: flex-end;
    }

    .hilo-score-pill {
        min-width: 120px;
        padding: 14px 16px;
        border: 1px solid #dbe2ea;
        border-radius: 14px;
        background: #ffffff;
    }

    .app.dark .hilo-score-pill {
        background: #1f2937;
        border-color: #374151;
        color: #f3f4f6;
    }

    .hilo-score-pill strong {
        display: block;
        font-size: 1.5rem;
        margin-top: 4px;
    }

    .hilo-score-label {
        display: block;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.72rem;
        color: #6b7280;
    }

    .app.dark .hilo-score-label {
        color: #9ca3af;
    }

    .hilo-status-banner {
        margin-bottom: 20px;
        padding: 14px 16px;
        border-radius: 14px;
        border: 1px solid #dbe2ea;
        background: #ffffff;
        color: #374151;
    }

    .app.dark .hilo-status-banner {
        background: #1f2937;
        border-color: #374151;
        color: #e5e7eb;
    }

    .hilo-status-banner-error {
        background: #fff1f2;
        border-color: #fecdd3;
        color: #be123c;
    }

    .app.dark .hilo-status-banner-error {
        background: #3f1d2e;
        border-color: #9f1239;
        color: #fecdd3;
    }

    .hilo-start-panel,
    .hilo-game-panel,
    .hilo-empty-state {
        border: 1px solid #dbe2ea;
        border-radius: 18px;
        background: #ffffff;
    }

    .app.dark .hilo-start-panel,
    .app.dark .hilo-game-panel,
    .app.dark .hilo-empty-state {
        background: #1f2937;
        border-color: #374151;
        color: #f3f4f6;
    }

    .hilo-start-panel {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        padding: 28px;
    }

    .hilo-start-copy h2,
    .hilo-empty-state h2 {
        margin: 0 0 12px;
        font-size: clamp(1.5rem, 4vw, 2rem);
    }

    .hilo-start-copy p,
    .hilo-empty-state p {
        margin: 0;
        max-width: 540px;
        color: #4b5563;
        line-height: 1.6;
    }

    .app.dark .hilo-start-copy p,
    .app.dark .hilo-empty-state p {
        color: #cbd5e1;
    }

    .hilo-feature-row {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 18px;
    }

    .hilo-feature-row span {
        padding: 8px 12px;
        border-radius: 999px;
        background: #eef2f7;
        border: 1px solid #dbe2ea;
        color: #475569;
        font-size: 0.9rem;
    }

    .app.dark .hilo-feature-row span {
        background: #273449;
        border-color: #3f4c61;
        color: #dbeafe;
    }

    .hilo-start-actions {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .hilo-primary-button,
    .hilo-secondary-button,
    .hilo-end-button,
    .hilo-guess-button {
        border-radius: 10px !important;
        padding: 10px 18px !important;
        font-weight: 700 !important;
        transition: background 180ms ease, border-color 180ms ease !important;
    }

    .hilo-primary-button {
        border: 1px solid #2563eb !important;
        background: #2563eb !important;
        color: #fff !important;
    }

    .hilo-secondary-button {
        border: 1px solid #d1d9e6 !important;
        background: #f8fafc !important;
        color: #1f2937 !important;
    }

    .app.dark .hilo-secondary-button {
        border-color: #4b5563 !important;
        background: #273449 !important;
        color: #f3f4f6 !important;
    }

    .hilo-end-button {
        border-color: #d1d9e6 !important;
        color: #1f2937 !important;
        background: #ffffff !important;
    }

    .app.dark .hilo-end-button {
        border-color: #4b5563 !important;
        background: #1f2937 !important;
        color: #f3f4f6 !important;
    }

    .hilo-primary-button:hover,
    .hilo-secondary-button:hover,
    .hilo-end-button:hover {
        opacity: 0.95;
    }

    .hilo-game-panel {
        padding: 24px;
    }

    .hilo-shell-active .hilo-game-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .hilo-matchup-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
        gap: 18px;
        align-items: center;
    }

    .hilo-shell-active .hilo-matchup-grid {
        flex: 1;
        align-items: stretch;
    }

    .hilo-versus-badge {
        display: grid;
        place-items: center;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: #eff6ff;
        color: #2563eb;
        font-weight: 800;
        letter-spacing: 0.12em;
        border: 1px solid #bfdbfe;
    }

    .hilo-movie-card {
        overflow: hidden;
        border: 1px solid #dbe2ea !important;
        border-radius: 16px !important;
        background: #ffffff !important;
        box-shadow: none !important;
    }

    .app.dark .hilo-movie-card {
        background: #243041 !important;
        border-color: #3c475b !important;
        color: #f3f4f6 !important;
    }

    .hilo-shell-active .hilo-movie-card {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .hilo-poster-frame {
        position: relative;
        overflow: hidden;
    }

    .hilo-poster {
        width: 100%;
        height: 430px;
        object-fit: cover;
    }

    .hilo-shell-active .hilo-poster {
        height: min(56vh, 620px);
    }

    .hilo-poster-overlay {
        position: absolute;
        left: 16px;
        right: 16px;
        bottom: 16px;
    }

    .hilo-poster-overlay span {
        display: inline-flex;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.92);
        color: #1f2937;
        font-size: 0.82rem;
        border: 1px solid #dbe2ea;
    }

    .app.dark .hilo-poster-overlay span {
        background: rgba(17, 24, 39, 0.88);
        border-color: #374151;
        color: #f3f4f6;
    }

    .hilo-movie-body {
        padding: 20px !important;
    }

    .hilo-movie-meta {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 10px;
        color: #6b7280;
        font-size: 0.88rem;
    }

    .app.dark .hilo-movie-meta {
        color: #9ca3af;
    }

    .hilo-movie-title {
        margin-bottom: 10px !important;
        color: #111827 !important;
        font-size: 1.35rem !important;
    }

    .app.dark .hilo-movie-title {
        color: #f9fafb !important;
    }

    .hilo-guess-button {
        width: 100%;
        border: 1px solid #d1d9e6 !important;
        background: #f8fafc !important;
        color: #1f2937 !important;
        opacity: 1 !important;
    }

    .app.dark .hilo-guess-button {
        border-color: #4b5563 !important;
        background: #273449 !important;
        color: #f3f4f6 !important;
    }

    .hilo-actions {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-top: 24px;
        flex-wrap: wrap;
    }

    .hilo-shell-active .hilo-actions {
        margin-top: 18px;
    }

    .hilo-empty-state {
        padding: 48px 24px;
        text-align: center;
    }

    @media (max-width: 992px) {
        .hilo-hero,
        .hilo-start-panel,
        .hilo-matchup-grid {
            grid-template-columns: 1fr;
            display: grid;
        }

        .hilo-scoreboard {
            justify-content: flex-start;
        }

        .hilo-start-panel {
            padding: 28px;
        }

        .hilo-versus-badge {
            margin: 0 auto;
        }
    }

    @media (max-width: 640px) {
        .hilo-page {
            padding: 24px 14px 40px;
        }

        .hilo-shell-active {
            padding: 14px 14px 20px;
        }

        .hilo-title {
            font-size: 2.5rem;
        }

        .hilo-status-banner,
        .hilo-game-panel,
        .hilo-start-panel,
        .hilo-empty-state {
            border-radius: 16px;
        }

        .hilo-game-panel {
            padding: 18px;
        }

        .hilo-poster {
            height: 340px;
        }

        .hilo-shell-active .hilo-poster {
            height: 42vh;
        }

        .hilo-score-pill {
            min-width: 118px;
        }
    }
`;

const Hilo = () => {

    // are we in the game yet
    const [gameStarted, setGameStarted] = useState(false);

    //current score
    const [score, setScore] = useState(0);

    //best score so far, just in this sesion 
    const [highScore, setHighScore] =  useState(0);

    //message box text
    const [statusMessage, setStatusMessage] =useState('Click start to begin your first round.');

    // holds the 2 movies on the screen
    const [movies, setMovies] = useState([]);

    //stops spam clicking if the fetch is still going
    const [isLoading, setIsLoading] = useState(false);

    // if the api fails or smth this shows what happened
    const [errorMessage, setErrorMessage]= useState('');

    //just gets a list of random movies w posters from the backend
    const fetchPosterMovies = async () => {
        const response = await fetch(`${API_BASE}/api/get`);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        return data.filter((movie) => movie.poster && movie.poster !== 'n/a');
    };

    // grab random movies from backend, then keep 2 with posters
    const loadMovieMatchup = async () => {
        setIsLoading(true);
        setErrorMessage('');
        setStatusMessage('Loading a new movie matchup...');

        try {
            const moviesWithPosters= await fetchPosterMovies();

            //just using the first 2 for now
            const matchup = moviesWithPosters.slice(0, 2);

            if (matchup.length < 2) {
                throw new Error('Not enough movies with posters were returned.');
            }

            setMovies(matchup);
            setStatusMessage('Pick a movie to keep on the board and a new challenger will swap in.');
        } catch (error) {
            console.error('Failed to load HiLo movies:', error);
            setMovies([]);


            //decent fallback msg if the db/api isnt ready yet
            setErrorMessage('Could not load movies yet. Make sure the backend is running and movie data has been created.');
            setStatusMessage('Unable to start a round right now.') ;
        } finally{
            setIsLoading(false);
        }
    };



    //start the game + load first 2 movies
    const handleStartGame = async () => {
        setGameStarted(true);
        setScore(0);
        await loadMovieMatchup();
    };




    //end game, save highscore if needed, reset some stuff
    const handleEndGame = () => {
        setHighScore((currentHighScore) => Math.max(currentHighScore, score));
        setGameStarted(false);
        setMovies([]);
        setErrorMessage('');
        setStatusMessage('Game over. Start a new round whenever you are ready.');
    };

    // click one of the movie buttons, keep that movie,swap the other one out
    const handleKeepMovie = async (sidePicked) => {
        if (isLoading || movies.length !== 2) {
            return;
        }

        const keepLeft = sidePicked === 'left';
        const movieToKeep = keepLeft ? movies[0] : movies[1];
        const movieToSwap = keepLeft ? movies[1] : movies[0];

        setIsLoading(true);
        setErrorMessage('');
        setStatusMessage(`Keeping ${movieToKeep.title} on the board...`);

        try {
            const moviesWithPosters = await fetchPosterMovies();

            const replacementMovie = moviesWithPosters.find((movie) =>
                movie.movieid !== movieToKeep.movieid && movie.movieid !== movieToSwap.movieid
            );

            if (!replacementMovie) {
                throw new Error('Could not find a different movie to swap in.');
            }

            if (keepLeft) {
                setMovies([movieToKeep, replacementMovie]);
            } else {
                setMovies([replacementMovie, movieToKeep]);
            }

            setScore((currentScore) => currentScore + 1);
            setStatusMessage(`${movieToKeep.title} stayed. A new challenger just swapped in.`);
        } catch (error) {
            console.error('Failed to swap HiLo movie:', error);
            setErrorMessage('Could not swap in a new movie right now.');
            setStatusMessage('The current matchup is still on screen.');
        } finally {
            setIsLoading(false);
        }
    };

   


    const renderMovieCard = (movie, variant) => {
        // genre tag over the poster, if there are genres at all
        const genreLabel = movie.genres && movie.genres.length > 0
            ? movie.genres.slice(0, 2).join(' • ')
            : 'Movie matchup';

        return (
            <Card key={movie.movieid} className="hilo-movie-card">
                <div className="hilo-poster-frame">
                    <Card.Img
                        variant="top"
                        src={movie.poster}
                        alt={`${movie.title} poster`}
                        className="hilo-poster"
                    />
                    <div className="hilo-poster-overlay">
                        <span>{genreLabel}</span>
                    </div>
                </div>
                <Card.Body className="hilo-movie-body">
                    {/* extra movie info under the poster */}
                    <div className="hilo-movie-meta">
                        <span>{movie.startYear || 'Year unknown'}</span>
                        <span>{movie.runtimeSeconds ? `${Math.round(movie.runtimeSeconds / 60)} min` : 'Runtime n/a'}</span>
                    </div>
                    <Card.Title className="hilo-movie-title">{movie.title}</Card.Title>
                   
                    {/*button keeps this movie on screen + swaps the other card */}
                    <Button
                        variant="light"
                        className="hilo-guess-button"
                        disabled={isLoading}
                        onClick={() => handleKeepMovie(variant)}
                    >
                        keep this movie :p
                    </Button>
                </Card.Body>
            </Card>
        );
    };




    return (
        <>
            {/* all page css gets dropped in here */}
            <style>{hiloStyles}</style>
            <div className={`hilo-page ${gameStarted ? 'hilo-page-active' : ''}`}>
                <section className={`hilo-shell ${gameStarted ? 'hilo-shell-active' : ''}`}>
                    {/* top area w title + score boxes */}
                    <div className="hilo-hero">
                        <div>
                            <p className="hilo-eyebrow">Movie duel</p>
                            <h1 className="hilo-title">HiLo</h1>
                            <p className="hilo-subtitle">
                                Pick a movie to keep on screen and the other one will swap out. 
                            </p>
                        </div>

                        <div className="hilo-scoreboard">
                            <div className="hilo-score-pill">
                                <span className="hilo-score-label">Score</span>
                                <strong>{score}</strong>
                            </div>
                            <div className="hilo-score-pill">
                                <span className="hilo-score-label">High score</span>
                                <strong>{highScore}</strong>
                            </div>
                        </div>
                    </div>

                    {/* this shows loading text / prompts / errors  */}
                    <div className={`hilo-status-banner ${errorMessage ? 'hilo-status-banner-error' : ''}`}>
                        {isLoading ? 'Loading a fresh matchup...' : statusMessage}
                    </div>



                    {!gameStarted ? (
                        // start screen before the game actually begins
                        <section className="hilo-start-panel">
                            <div className="hilo-start-copy">

                                <h2>Ready for the first matchup?</h2>
                                <p>
                                    Start the game to pull two movie posters and guess which one earned more at the box office. It&apos;s a fun way to test your movie knowledge and discover new films along the way.
                                </p>
                                <div className="hilo-feature-row">
                                    <span>Live movie posters</span>
                                    <span>Fast reshuffle</span>
                                    <span>Score tracking</span>
                                </div>
                            </div>

                            <div className="hilo-start-actions">
                                <Button className="hilo-primary-button" onClick={handleStartGame} disabled={isLoading}>
                                    Start Game
                                </Button>
                            </div>
                        </section>
                    ) : (
                        // actual game area after start gets clicked
                        <section className="hilo-game-panel">
                            {movies.length === 2 ? (
                                // normal state, 2 movies loaded and ready

                                
                                <div className="hilo-matchup-grid">
                                    {renderMovieCard(movies[0], 'left')}
                                    <div className="hilo-versus-badge">VS</div>
                                    {renderMovieCard(movies[1], 'right')}
                                </div>



                            ) : (
                                // fallback if the fetch is still weird or empty
                                <div className="hilo-empty-state">
                                    <h2>Matchup waiting room</h2>
                                    <p>
                                        Once the API returns two movies with posters, they&apos;ll appear here.
                                    </p>
                                </div>
                            )}

                            {/* buttons for new matchup / end game */}
                            <div className="hilo-actions">
                                <Button className="hilo-secondary-button" onClick={loadMovieMatchup} disabled={isLoading}>
                                    New Matchup
                                </Button>
                                <Button variant="outline-light" className="hilo-end-button" onClick={handleEndGame}>
                                    End Game
                                </Button>
                            </div>
                        </section>
                    )}
                </section>
            </div>
        </>
    );
};

export default Hilo;

