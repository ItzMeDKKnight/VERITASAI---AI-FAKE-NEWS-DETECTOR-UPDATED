
import React, { useState, useCallback, useMemo } from 'react';
import { GeminiService } from './services/geminiService';
import { AnalysisState } from './types';
import NewsInput from './components/NewsInput';
import ResultView from './components/ResultView';
import { useLanguage } from './contexts/LanguageContext';
import { useTheme } from './contexts/ThemeContext';
import { languages, Language } from './data/translations';

const App: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    result: null,
    error: null,
    currentStep: '',
  });

  const geminiService = useMemo(() => new GeminiService(), []);

  const handleAnalyze = useCallback(async (text: string, imageData?: string) => {
    setState({
      isAnalyzing: true,
      result: null,
      error: null,
      currentStep: t('stepInitializing'),
    });

    try {
      const currentParams = {
        langName: languages[language],
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      };

      const result = await geminiService.analyzeNews(text, (step) => {
        // We could translate these steps too if they were static keys, 
        // but for now we'll keep the dynamic message or map common ones.
        // For simplicity, using the raw message or simple mapping if needed.
        if (step.includes('Initializing')) setState(prev => ({ ...prev, currentStep: t('stepInitializing') }));
        else if (step.includes('Connecting') || step.includes('cross-references')) setState(prev => ({ ...prev, currentStep: t('stepCrossRencing') }));
        else setState(prev => ({ ...prev, currentStep: step }));
      }, currentParams.langName, currentParams.date, imageData);
      setState({
        isAnalyzing: false,
        result,
        error: null,
        currentStep: '',
      });
    } catch (err: any) {
      setState({
        isAnalyzing: false,
        result: null,
        error: err.message || t('errorGeneric'),
        currentStep: '',
      });
    }
  }, [geminiService, t, language]);

  return (
    <div className="min-h-screen relative selection:bg-blue-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] right-[15%] w-[10%] h-[10%] bg-purple-600/5 rounded-full blur-[60px]"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-indigo-100 dark:border-white/5 py-4 px-6 md:px-12 flex items-center justify-between transition-colors duration-300">
        {/* Left: Language Selector */}
        <div className="flex items-center">
          <div className="relative group">
            <button className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-sm">
              <i className="fas fa-globe"></i>
              <span>{languages[language]}</span>
              <i className="fas fa-chevron-down text-xs"></i>
            </button>
            {/* Dropdown */}
            <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 max-h-80 overflow-y-auto">
              {Object.entries(languages).map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => setLanguage(code as Language)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${language === code ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-400'
                    }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Logo */}
        <div className="flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <i className="fas fa-shield-virus text-white text-xl"></i>
          </div>
          <span className="hidden md:inline font-display font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">
            {t('appTitle')}<span className="text-blue-500 dark:text-blue-400">{t('appTitleSuffix')}</span>
          </span>
        </div>

        {/* Right: Theme Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-white transition-all flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
          </button>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <div className="text-center px-4 max-w-3xl mx-auto space-y-6">
          <div className="inline-block py-1 px-4 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">
            {t('tagline')}
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-display leading-tight text-slate-900 dark:text-white">
            {t('heroTitle')} <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400 dark:from-blue-400 dark:to-cyan-300">{t('heroTitleSuffix')}</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-light">
            {t('heroDescription')}
          </p>
        </div>

        <NewsInput onAnalyze={handleAnalyze} isLoading={state.isAnalyzing} />

        {/* Loading Overlay */}
        {state.isAnalyzing && (
          <div className="w-full max-w-4xl mx-auto mt-12 px-4 animate-in fade-in duration-500">
            <div className="glass-panel rounded-2xl p-12 border border-blue-500/20 relative overflow-hidden">
              <div className="shimmer absolute inset-0 opacity-20"></div>
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-blue-500/20 rounded-full animate-ping absolute inset-0"></div>
                  <div className="w-24 h-24 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest">{state.currentStep}</h3>
                  <p className="text-slate-500 text-sm animate-pulse">{t('stepCrossRencing')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Handling */}
        {state.error && (
          <div className="w-full max-w-4xl mx-auto mt-8 px-4">
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center gap-4 text-rose-600 dark:text-rose-400">
              <i className="fas fa-circle-exclamation text-xl"></i>
              <p className="text-sm font-medium">{state.error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {state.result && <ResultView result={state.result} />}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 dark:border-white/5 py-12 px-6 text-center text-slate-500 text-sm transition-colors duration-300">
        <p>{t('footerRights')}</p>
        <div className="flex justify-center gap-6 mt-6 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
          <i className="fab fa-twitter text-xl"></i>
          <i className="fab fa-linkedin text-xl"></i>
          <i className="fab fa-github text-xl"></i>
        </div>
      </footer>
    </div>
  );
};

export default App;
