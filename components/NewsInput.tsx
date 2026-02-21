import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface NewsInputProps {
  onAnalyze: (text: string, imageData?: string) => void;
  isLoading: boolean;
}

const NewsInput: React.FC<NewsInputProps> = ({ onAnalyze, isLoading }) => {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { isListening, transcript, startListening, stopListening, hasRecognitionSupport, resetTranscript } = useSpeechRecognition();

  React.useEffect(() => {
    if (transcript) {
      setText((prev) => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + transcript.trim());
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 5 && !selectedImage) return;
    onAnalyze(text, selectedImage || undefined);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 px-4">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative glass-panel rounded-2xl p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest text-left">{t('inputLabel')}</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-slate-700 hover:text-blue-600"
                title="Upload Image"
              >
                <i className="fas fa-image"></i>
                Image
              </button>
              {hasRecognitionSupport && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-slate-700 hover:text-blue-600'
                    }`}
                >
                  <i className={`fas ${isListening ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
                  {isListening ? 'Listening...' : 'Voice Input'}
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('inputPlaceholder')}
              className={`w-full ${selectedImage ? 'h-32' : 'h-48'} bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none`}
              disabled={isLoading}
            />
            {selectedImage && (
              <div className="mt-4 relative inline-block">
                <img src={selectedImage} alt="Preview" className="h-32 rounded-lg border border-slate-200 dark:border-slate-700 shadow-md object-cover" />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-rose-600 shadow-lg transition-colors"
                  title="Remove Image"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 italic">
              {t('inputDisclaimer')}
            </p>
            <button
              type="submit"
              disabled={isLoading || (text.trim().length < 5 && !selectedImage)}
              className={`px-8 py-3 rounded-xl font-display font-bold text-sm tracking-widest uppercase transition-all flex items-center gap-2 ${isLoading || (text.trim().length < 5 && !selectedImage)
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-95'
                }`}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  {t('processing')}
                </>
              ) : (
                <>
                  <i className="fas fa-shield-halved"></i>
                  {t('verifyButton')}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewsInput;
