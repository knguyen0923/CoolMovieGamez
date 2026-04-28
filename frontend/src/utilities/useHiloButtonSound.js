import { useEffect, useRef } from 'react';

const DEFAULT_BUTTON_SOUND_PATH = '/sounds/hilo-button-click.wav';

const useHiloButtonSound = ({
    soundPath = DEFAULT_BUTTON_SOUND_PATH,
    volume = 0.4,
    errorLabel = 'HiLo button sound',
} = {}) => {
    const buttonSoundRef = useRef(null);

    useEffect(() => {
        const audio = new Audio(`${process.env.PUBLIC_URL}${soundPath}`);
        audio.preload = 'auto';
        audio.volume = volume;
        buttonSoundRef.current = audio;
    }, [soundPath, volume]);

    const playButtonSound = () => {
        const audio = buttonSoundRef.current;

        if (!audio) {
            return;
        }

        const soundInstance = audio.cloneNode();
        soundInstance.volume = audio.volume;
        soundInstance.play().catch((error) => {
            if (error?.name !== 'NotAllowedError') {
                console.error(`Failed to play ${errorLabel}:`, error);
            }
        });
    };

    return playButtonSound;
};

export default useHiloButtonSound;
