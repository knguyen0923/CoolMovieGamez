import React, { useContext, useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { UserContext } from '../../App';
import getUserInfo from '../../utilities/decodeJwt';
import useHiloButtonSound from '../../utilities/useHiloButtonSound';
import '../../css/hilo.css';

// base url for the backend stuff
const API_BASE = 'http://localhost:8081';
const MAX_ROUND_SCORE = 5000;
const SCORE_DECAY_PER_MS = 1;
const MIN_ROUND_SCORE = 500;
const COIN_DIVISOR = 2000;
const HIGH_SCORE_STORAGE_KEY = 'hilo-high-score';
const BEST_STREAK_STORAGE_KEY = 'hilo-best-streak';
const TOTAL_COINS_STORAGE_KEY = 'hilo-total-coins';
const GUESS_REVEAL_DURATION_MS = 950;
const MAX_CORRECT_GUESSES = 10;
const HILO_END_GAME_SOUND_PATH = '/sounds/506053__mellau__button-click-2.wav';

const formatVoteCount = (value) => Number(value || 0).toLocaleString();
const formatResponseTime = (ms) => `${(ms / 1000).toFixed(1)}s`;
const getUserScopedStorageKey = (baseKey, username) => `${baseKey}:${username}`;

const Hilo = () => {
    const contextUser = useContext(UserContext);
    const user = contextUser || getUserInfo();
    const playButtonSound = useHiloButtonSound();
    const playEndGameSound = useHiloButtonSound({
        soundPath: HILO_END_GAME_SOUND_PATH,
        volume: 0.45,
        errorLabel: 'HiLo end game sound',
    });

    // are we in the game yet
    const [gameStarted, setGameStarted] = useState(false);

    //current score
    const [score, setScore] = useState(0);

    //coin total for the current run
    const [coins, setCoins] = useState(0);
    const [totalCoins, setTotalCoins] = useState(0);

    // round win counters
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [roundsWon, setRoundsWon] = useState(0);

    //best score so far, stored locally
    const [highScore, setHighScore] =  useState(0);

    //message box text
    const [statusMessage, setStatusMessage] =useState('Click start to begin your first round.');

    // holds the 2 movies on the screen
    const [movies, setMovies] = useState([]);

    // queued challengers so the game does not need to refetch every guess
    const [moviePool, setMoviePool] = useState([]);

    //stops spam clicking if the fetch is still going
    const [isLoading, setIsLoading] = useState(false);

    // if the api fails or smth this shows what happened
    const [errorMessage, setErrorMessage]= useState('');
    // temporary reveal state after a correct guess
    const [guessResult, setGuessResult] = useState(null);
    // swaps the small status bar for the bigger ending screen
    const [showGameOverPanel, setShowGameOverPanel] = useState(false);

    // tracks response timing for score decay
    const roundStartedAtRef = useRef(null);
    // tracks how long the same winning movie has stayed on screen
    const carryoverTrackerRef = useRef({ movieId: null, wins: 0 });

    // pull local progress back in for the active signed-in user only
    useEffect(() => {
        if (!user?.username) {
            setHighScore(0);
            setBestStreak(0);
            setTotalCoins(0);
            return;
        }

        const storedHighScore = Number(localStorage.getItem(getUserScopedStorageKey(HIGH_SCORE_STORAGE_KEY, user.username)) || 0);
        if (!Number.isNaN(storedHighScore)) {
            setHighScore(storedHighScore);
        }

        const storedBestStreak = Number(localStorage.getItem(getUserScopedStorageKey(BEST_STREAK_STORAGE_KEY, user.username)) || 0);
        if (!Number.isNaN(storedBestStreak)) {
            setBestStreak(storedBestStreak);
        }

        const storedTotalCoins = Number(localStorage.getItem(getUserScopedStorageKey(TOTAL_COINS_STORAGE_KEY, user.username)) || 0);
        if (!Number.isNaN(storedTotalCoins)) {
            setTotalCoins(storedTotalCoins);
        }
    }, [user?.username]);

    // keep local stats scoped to the current signed-in player
    useEffect(() => {
        if (!user?.username) {
            return;
        }

        localStorage.setItem(getUserScopedStorageKey(HIGH_SCORE_STORAGE_KEY, user.username), String(highScore));
    }, [highScore, user?.username]);

    // keep best streak saved between refreshes
    useEffect(() => {
        if (!user?.username) {
            return;
        }

        localStorage.setItem(getUserScopedStorageKey(BEST_STREAK_STORAGE_KEY, user.username), String(bestStreak));
    }, [bestStreak, user?.username]);

    // cache total coins locally so the page feels instant on reload
    useEffect(() => {
        if (!user?.username) {
            return;
        }

        localStorage.setItem(getUserScopedStorageKey(TOTAL_COINS_STORAGE_KEY, user.username), String(totalCoins));
    }, [totalCoins, user?.username]);

    // sync coin total with the profile when a logged-in user opens the page
    useEffect(() => {
        if (!user?.username) {
            return;
        }

        const loadProfileCoins = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/userProfile/${user.username}`);

                if (!response.ok) {
                    throw new Error(`Profile coin load failed: ${response.status}`);
                }

                const data = await response.json();
                setTotalCoins(Number(data.profile?.coins) || 0);
            } catch (error) {
                console.error('Failed to load total HiLo coins:', error);
            }
        };

        loadProfileCoins();
    }, [user?.username]);

    // save the finished run to the shared leaderboard
    const saveLeaderboardScore = async (finalScore) => {
        if (!user?.username || finalScore <= 0) {
            return;
        }

        const response = await fetch(`${API_BASE}/leaderboard/hilo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: user.username,
                score: finalScore,
            }),
        });

        if (!response.ok) {
            throw new Error(`Leaderboard save failed: ${response.status}`);
        }
    };

    // add earned coins onto the users saved profile total
    const awardCoinsToProfile = async (coinsEarned) => {
        if (!user?.username || coinsEarned <= 0) {
            return;
        }

        const response = await fetch(`${API_BASE}/api/userProfile/${user.username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                coinsDelta: coinsEarned,
            }),
        });

        if (!response.ok) {
            throw new Error(`Coin update failed: ${response.status}`);
        }

        const data = await response.json();
        setTotalCoins(Number(data.profile?.coins) || 0);
        window.dispatchEvent(new Event("coinsUpdated"));
    };

    const calculateRoundScore = (timeTakenMs) => (
        Math.max(MIN_ROUND_SCORE, MAX_ROUND_SCORE - (timeTakenMs * SCORE_DECAY_PER_MS))
    );

    // converts score into coin rewards for the round
    const calculateRoundCoins = (roundScore) => Math.floor(roundScore / COIN_DIVISOR);

    //just gets a list of random movies w posters from the backend
    const fetchPosterMovies = async (excludedMovieIds = []) => {
        const response = await fetch(`${API_BASE}/api/get`);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        const seenMovieIds = new Set(excludedMovieIds);

        return data.filter((movie) => {
            if (!movie.poster || movie.poster === 'n/a') {
                return false;
            }

            if (Number(movie.votecount || 0) <= 1) {
                return false;
            }

            if (!movie.movieid || seenMovieIds.has(movie.movieid)) {
                return false;
            }

            seenMovieIds.add(movie.movieid);
            return true;
        });
    };

    const beginRound = (nextMovies, nextPool, nextMessage) => {
        setGuessResult(null);
        setMovies(nextMovies);
        setMoviePool(nextPool);
        roundStartedAtRef.current = Date.now();
        setStatusMessage(nextMessage);
    };

    // lets the vote reveal / shake animation breathe before the next round
    const pauseForReveal = () => new Promise((resolve) => {
        window.setTimeout(resolve, GUESS_REVEAL_DURATION_MS);
    });

    // grab random movies from backend, then keep 2 with posters
    const loadMovieMatchup = async () => {
        setIsLoading(true);
        setErrorMessage('');
        setStatusMessage('Loading a new movie matchup...');

        try {
            const moviesWithPosters = await fetchPosterMovies();
            const matchup = moviesWithPosters.slice(0, 2);

            if (matchup.length < 2) {
                throw new Error('Not enough movies with posters were returned.');
            }

            beginRound(
                matchup,
                moviesWithPosters.slice(2),
                'Pick the movie you think has more IMDb votes. Faster correct answers are worth more points.'
            );
        } catch (error) {
            console.error('Failed to load HiLo movies:', error);
            setGameStarted(false);
            setMovies([]);
            setMoviePool([]);

            //decent fallback msg if the db/api isnt ready yet
            setErrorMessage('Could not load movies yet. Make sure the backend is running and movie data has been created.');
            setStatusMessage('Unable to start a round right now.');
        } finally{
            setIsLoading(false);
        }
    };

    // pulls a single replacement from the queued pool, or refetches if needed
    const getReplacementMovie = async (excludedMovieIds) => {
        const pooledReplacement = moviePool.find((movie) => !excludedMovieIds.includes(movie.movieid));

        if (pooledReplacement) {
            const remainingPool = moviePool.filter((movie) => movie.movieid !== pooledReplacement.movieid);
            return { replacementMovie: pooledReplacement, remainingPool };
        }

        const refreshedPool = await fetchPosterMovies(excludedMovieIds);
        const [replacementMovie, ...remainingPool] = refreshedPool;

        if (!replacementMovie) {
            throw new Error('Could not find a different movie to swap in.');
        }

        return { replacementMovie, remainingPool };
    };

    // same idea as above, but used when both cards need a full refresh
    const getReplacementMovies = async (count, excludedMovieIds) => {
        const excludedMovieIdsSet = new Set(excludedMovieIds);
        const pooledReplacements = [];
        const remainingPool = [];

        moviePool.forEach((movie) => {
            if (
                pooledReplacements.length < count &&
                !excludedMovieIdsSet.has(movie.movieid) &&
                !pooledReplacements.some((candidate) => candidate.movieid === movie.movieid)
            ) {
                pooledReplacements.push(movie);
                return;
            }

            remainingPool.push(movie);
        });

        if (pooledReplacements.length === count) {
            return { replacementMovies: pooledReplacements, remainingPool };
        }

        const neededCount = count - pooledReplacements.length;
        const refreshedPool = await fetchPosterMovies([
            ...excludedMovieIds,
            ...pooledReplacements.map((movie) => movie.movieid),
        ]);
        const freshCandidates = refreshedPool.filter((movie) => (
            !excludedMovieIdsSet.has(movie.movieid) &&
            !pooledReplacements.some((candidate) => candidate.movieid === movie.movieid)
        ));
        const additionalReplacements = freshCandidates.slice(0, neededCount);

        if (additionalReplacements.length < neededCount) {
            throw new Error('Could not find enough replacement movies.');
        }

        return {
            replacementMovies: [...pooledReplacements, ...additionalReplacements],
            remainingPool: [...remainingPool, ...freshCandidates.slice(neededCount)],
        };
    };

    // wraps up the run, shows the ending screen, and saves progress if possible
    const finishGame = async (endMessage, finalScore = score, finalCoins = coins) => {
        let nextStatusMessage = `${endMessage} Final score: ${finalScore}. Coins earned: ${finalCoins}.`;

        setIsLoading(true);
        setGameStarted(false);
        setShowGameOverPanel(true);
        setMovies([]);
        setMoviePool([]);
        setErrorMessage('');
        setGuessResult(null);
        setStreak(0);
        carryoverTrackerRef.current = { movieId: null, wins: 0 };
        roundStartedAtRef.current = null;

        try {
            if (user?.username) {
                const [leaderboardResult, coinsResult] = await Promise.allSettled([
                    saveLeaderboardScore(finalScore),
                    awardCoinsToProfile(finalCoins),
                ]);

                const savedScore = leaderboardResult.status === 'fulfilled';
                const savedCoins = coinsResult.status === 'fulfilled';

                if (savedScore && savedCoins && (finalScore > 0 || finalCoins > 0)) {
                    nextStatusMessage += ' Your score and coins were saved.';
                } else if (savedScore && !savedCoins) {
                    nextStatusMessage += ' Your score was saved, but coins could not be added to your profile.';
                } else if (!savedScore && savedCoins) {
                    nextStatusMessage += ' Your coins were saved, but the leaderboard score could not be updated.';
                } else if ((finalScore > 0 || finalCoins > 0) && (!savedScore || !savedCoins)) {
                    nextStatusMessage += ' Saving failed this time.';
                    throw new Error('Leaderboard score and coin save both failed.');
                }
            } else if (finalScore > 0 || finalCoins > 0) {
                nextStatusMessage += ' Log in to save your score and coins.';
            }
        } catch (error) {
            console.error('Failed to save HiLo rewards:', error);
            setErrorMessage('Your run ended, but your leaderboard score or coins could not be saved.');
        } finally {
            setHighScore((currentHighScore) => Math.max(currentHighScore, finalScore));
            setStatusMessage(nextStatusMessage);
            setIsLoading(false);
        }
    };

    //start the game + load first 2 movies
    const handleStartGame = async () => {
        playButtonSound();
        setGameStarted(true);
        setShowGameOverPanel(false);
        setScore(0);
        setCoins(0);
        setStreak(0);
        setRoundsWon(0);
        setGuessResult(null);
        carryoverTrackerRef.current = { movieId: null, wins: 0 };
        await loadMovieMatchup();
    };

    //end game, save highscore if needed, reset some stuff
    const handleEndGame = async () => {
        playEndGameSound();
        await finishGame('Game over. Start a new round whenever you are ready.');
    };

    // click one of the movie buttons and resolve the round
    const handleKeepMovie = async (sidePicked) => {
        if (isLoading || movies.length !== 2) {
            return;
        }

        playButtonSound();

        const keepLeft = sidePicked === 'left';
        const pickedMovie = keepLeft ? movies[0] : movies[1];
        const otherMovie = keepLeft ? movies[1] : movies[0];
        const pickedVotes = Number(pickedMovie.votecount || 0);
        const otherVotes = Number(otherMovie.votecount || 0);
        const responseTimeMs = Math.max(0, Date.now() - (roundStartedAtRef.current || Date.now()));
        const isCorrectGuess = pickedVotes >= otherVotes;

        setIsLoading(true);
        setErrorMessage('');

        try {
            if (!isCorrectGuess) {
                setBestStreak((currentBest) => Math.max(currentBest, streak));
                await finishGame(
                    `Wrong guess. ${otherMovie.title} had more IMDb votes than ${pickedMovie.title} (${formatVoteCount(otherVotes)} vs ${formatVoteCount(pickedVotes)}).`
                );
                return;
            }

            const roundScore = calculateRoundScore(responseTimeMs);
            const roundCoins = calculateRoundCoins(roundScore);
            const nextStreak = streak + 1;
            const nextRoundsWon = roundsWon + 1;
            const nextCarryWins = carryoverTrackerRef.current.movieId === pickedMovie.movieid
                ? carryoverTrackerRef.current.wins + 1
                : 1;
            const shouldSwapBothMovies = nextCarryWins >= 3;
            const winnerSide = keepLeft ? 'left' : 'right';
            const loserSide = keepLeft ? 'right' : 'left';
            const nextScore = score + roundScore;
            const nextCoins = coins + roundCoins;
            let nextMovies;
            let remainingPool;
            let nextStatusMessage = `Correct. ${pickedMovie.title} wins with ${formatVoteCount(pickedVotes)} votes. +${roundScore} score, +${roundCoins} coins in ${formatResponseTime(responseTimeMs)}.`;

            setGuessResult({
                winnerSide,
                loserSide,
                votes: {
                    left: Number(movies[0]?.votecount || 0),
                    right: Number(movies[1]?.votecount || 0),
                },
            });

            if (shouldSwapBothMovies) {
                const { replacementMovies, remainingPool: updatedPool } = await getReplacementMovies(2, [pickedMovie.movieid, otherMovie.movieid]);
                nextMovies = replacementMovies;
                remainingPool = updatedPool;
                carryoverTrackerRef.current = { movieId: null, wins: 0 };
                nextStatusMessage += ` ${pickedMovie.title} stayed on top for three rounds in a row, so both movies were swapped.`;
            } else {
                const { replacementMovie, remainingPool: updatedPool } = await getReplacementMovie([pickedMovie.movieid, otherMovie.movieid]);
                nextMovies = keepLeft
                    ? [pickedMovie, replacementMovie]
                    : [replacementMovie, pickedMovie];
                remainingPool = updatedPool;
                carryoverTrackerRef.current = { movieId: pickedMovie.movieid, wins: nextCarryWins };
            }

            setStatusMessage(`${pickedMovie.title} wins with ${formatVoteCount(pickedVotes)} votes. ${otherMovie.title} had ${formatVoteCount(otherVotes)}. Next matchup coming up...`);

            setScore(nextScore);
            setCoins(nextCoins);
            setRoundsWon(nextRoundsWon);
            setStreak(nextStreak);
            setBestStreak((currentBest) => Math.max(currentBest, nextStreak));

            await pauseForReveal();

            if (nextRoundsWon >= MAX_CORRECT_GUESSES) {
                await finishGame(
                    `You hit the ${MAX_CORRECT_GUESSES}-guess cap. Run complete.`,
                    nextScore,
                    nextCoins
                );
                return;
            }

            beginRound(
                nextMovies,
                remainingPool,
                nextStatusMessage
            );
        } catch (error) {
            console.error('Failed to swap HiLo movie:', error);
            setGuessResult(null);
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
        const isWinningCard = guessResult?.winnerSide === variant;
        const isLosingCard = guessResult?.loserSide === variant;
        const voteCount = guessResult?.votes?.[variant];
        const cardClassName = [
            'hilo-movie-card',
            isWinningCard ? 'hilo-movie-card-correct' : '',
            isLosingCard ? 'hilo-movie-card-incorrect' : '',
        ].filter(Boolean).join(' ');

        return (
            <Card key={movie.movieid} className={cardClassName}>
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
                    {guessResult && typeof voteCount === 'number' && (
                        <div className={`hilo-vote-reveal ${isLosingCard ? 'hilo-vote-reveal-incorrect' : ''}`}>
                            IMDb votes: {formatVoteCount(voteCount)}
                        </div>
                    )}
                    <Card.Title className="hilo-movie-title">{movie.title}</Card.Title>
                    <p className="mb-3 text-muted">Choose the movie you think has the higher hidden IMDb vote count.</p>
                   
                    {/*button keeps this movie on screen + swaps the other card */}
                    <Button
                        variant="light"
                        className="hilo-guess-button"
                        disabled={isLoading || Boolean(guessResult)}
                        onClick={() => handleKeepMovie(variant)}
                    >
                        Higher votes
                    </Button>
                </Card.Body>
            </Card>
        );
    };




    return (
        <>
            <div className={`hilo-page ${gameStarted ? 'hilo-page-active' : ''}`}>
                <section className={`hilo-shell ${gameStarted ? 'hilo-shell-active' : ''}`}>
                    {/* top area w title + score boxes */}
                    <div className="hilo-hero">
                        <div>
                            <p className="hilo-eyebrow">Movie duel</p>
                            <h1 className="hilo-title">HiLo</h1>
                            <p className="hilo-subtitle">
                                Pick the movie you think has more IMDb votes. Fast correct guesses are worth more points, every 2000 points becomes 1 coin, and one wrong answer ends the run.
                            </p>
                        </div>

                        <div className="hilo-scoreboard">
                            <div className="hilo-score-pill">
                                <span className="hilo-score-label">Score</span>
                                <strong>{score}</strong>
                            </div>
                            <div className="hilo-score-pill">
                                <span className="hilo-score-label">Total coins</span>
                                <strong>{totalCoins + coins}</strong>
                            </div>
                            <div className="hilo-score-pill">
                                <span className="hilo-score-label">Streak</span>
                                <strong>{streak}</strong>
                            </div>
                            <div className="hilo-score-pill">
                                <span className="hilo-score-label">Best streak</span>
                                <strong>{bestStreak}</strong>
                            </div>
                            <div className="hilo-score-pill">
                                <span className="hilo-score-label">Rounds won</span>
                                <strong>{roundsWon}</strong>
                            </div>
                            <div className="hilo-score-pill">
                                <span className="hilo-score-label">High score</span>
                                <strong>{highScore}</strong>
                            </div>
                        </div>
                    </div>

                    {/* this shows loading text / prompts / errors  */}
                    {(!showGameOverPanel || gameStarted) && (
                        <div className={`hilo-status-banner ${errorMessage ? 'hilo-status-banner-error' : ''}`}>
                            {isLoading && !guessResult ? 'Updating the matchup...' : statusMessage}
                        </div>
                    )}



                    {!gameStarted ? (
                        showGameOverPanel ? (
                            <section className="hilo-gameover-panel">
                                <div className="hilo-gameover-copy">
                                    <p className="hilo-gameover-kicker">Run Finished</p>
                                    <h2>Nice run.</h2>
                                    <p>{statusMessage}</p>
                                </div>

                                <div className="hilo-gameover-stats">
                                    <div className="hilo-gameover-stat">
                                        <span>Final score</span>
                                        <strong>{score}</strong>
                                    </div>
                                    <div className="hilo-gameover-stat">
                                        <span>Coins earned</span>
                                        <strong>{coins}</strong>
                                    </div>
                                    <div className="hilo-gameover-stat">
                                        <span>Correct guesses</span>
                                        <strong>{roundsWon}</strong>
                                    </div>
                                </div>

                                <div className="hilo-start-actions">
                                    <Button className="hilo-primary-button" onClick={handleStartGame} disabled={isLoading}>
                                        Start New Run
                                    </Button>
                                </div>
                            </section>
                        ) : (
                            // start screen before the game actually begins
                            <section className="hilo-start-panel">
                                <div className="hilo-start-copy">

                                    <h2>Ready for the first matchup?</h2>
                                    <p>
                                        Start a run to compare two movie posters at a time. Pick the one you think has more IMDb votes, build your streak, and rack up score before one wrong guess ends the run.
                                    </p>
                                    <div className="hilo-feature-row">
                                        <span>Live movie posters</span>
                                        <span>Time-based score</span>
                                        <span>Coin rewards</span>
                                    </div>
                                </div>

                                <div className="hilo-start-actions">
                                    <Button className="hilo-primary-button" onClick={handleStartGame} disabled={isLoading}>
                                        Start Game
                                    </Button>
                                </div>
                            </section>
                        )
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
