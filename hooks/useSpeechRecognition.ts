
import { useState, useEffect, useCallback } from 'react';

interface SpeechRecognitionHook {
    isListening: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
    hasRecognitionSupport: boolean;
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        // Check for browser support
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (SpeechRecognition) {
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = true;
            recognitionInstance.interimResults = true;
            recognitionInstance.lang = 'en-US'; // Default to English, can be made dynamic later

            recognitionInstance.onstart = () => {
                setIsListening(true);
            };

            recognitionInstance.onend = () => {
                setIsListening(false);
            };

            recognitionInstance.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcriptSegment = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcriptSegment + ' ';
                    }
                }
                if (finalTranscript) {
                    setTranscript((prev) => prev ? prev + ' ' + finalTranscript : finalTranscript);
                }
            };

            recognitionInstance.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            setRecognition(recognitionInstance);
        }
    }, []);

    const startListening = useCallback(() => {
        if (recognition && !isListening) {
            try {
                recognition.start();
            } catch (e) {
                console.error("Failed to start recognition", e);
            }
        }
    }, [recognition, isListening]);

    const stopListening = useCallback(() => {
        if (recognition && isListening) {
            recognition.stop();
        }
    }, [recognition, isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        hasRecognitionSupport: !!recognition
    };
};
