
import React, { useState } from 'react';
import { AnalysisResult, Verdict } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ResultViewProps {
  result: AnalysisResult;
}

const ResultView: React.FC<ResultViewProps> = ({ result }) => {
  const { t } = useLanguage();
  const [feedback, setFeedback] = useState<'thumbsUp' | 'thumbsDown' | null>(null);

  const getVerdictStyle = (verdict: Verdict) => {
    switch (verdict) {
      case Verdict.REAL:
        return { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-400/10', border: 'border-emerald-200 dark:border-emerald-500/30', icon: 'fa-check-double' };
      case Verdict.FAKE:
        return { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-400/10', border: 'border-rose-200 dark:border-rose-500/30', icon: 'fa-triangle-exclamation' };
      case Verdict.MISLEADING:
        return { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-400/10', border: 'border-amber-200 dark:border-amber-500/30', icon: 'fa-circle-exclamation' };
      default:
        return { color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-400/10', border: 'border-slate-200 dark:border-slate-500/30', icon: 'fa-question' };
    }
  };

  const style = getVerdictStyle(result.verdict);

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 px-4 pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Result Section */}
      <div className={`glass-panel rounded-3xl p-8 border ${style.border} relative overflow-hidden transition-colors duration-300`}>
        <div className={`absolute top-0 right-0 p-4 font-display text-xs tracking-widest uppercase ${style.color}`}>
          {t('confidence')}: {result.confidenceScore}%
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className={`w-32 h-32 rounded-2xl ${style.bg} border ${style.border} flex items-center justify-center text-4xl ${style.color} shrink-0`}>
            {result.isSensitive ? (
              <i className="fas fa-eye-slash animate-pulse text-rose-500"></i>
            ) : (
              <i className={`fas ${style.icon}`}></i>
            )}
          </div>
          <div className="text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
              <h2 className="text-sm font-display uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{t('finalVerdict')}</h2>
              {result.isSensitive && (
                <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <i className="fas fa-triangle-exclamation"></i>
                  Sensitive Info
                </span>
              )}
            </div>
            <h1 className={`text-4xl md:text-6xl font-bold font-display uppercase ${style.color}`}>
              {result.verdict}
            </h1>
            <p className="mt-4 text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
              {result.summary}
            </p>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end items-center gap-4">
          {feedback ? (
            <span className="text-sm font-medium text-blue-500 animate-pulse">{t('feedbackThanks')}</span>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setFeedback('thumbsUp')}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
              >
                <i className="fas fa-thumbs-up"></i>
              </button>
              <button
                onClick={() => setFeedback('thumbsDown')}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
              >
                <i className="fas fa-thumbs-down"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Reasoning */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-display text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <i className="fas fa-microchip text-blue-500 dark:text-blue-400"></i> {t('logicalAnalysis')}
          </h3>
          <ul className="space-y-3">
            {result.reasoning.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                <span className="text-blue-500 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Bias & Sentiment */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-display text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <i className="fas fa-scale-balanced text-purple-500 dark:text-purple-400"></i> {t('biasDetection')}
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
            "{result.biasAnalysis}"
          </p>
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="text-xs text-slate-500">
              {t('languageDetected')} <span className="text-slate-800 dark:text-slate-300 font-bold">{result.detectedLanguage}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Factual Checks */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-display text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">{t('factualVerification')}</h3>
        <div className="space-y-4">
          {result.factualChecks.map((check, i) => (
            <div key={i} className="bg-slate-50/50 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800/50 flex gap-4">
              <div className={`mt-1 ${check.isCorrect ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                <i className={`fas ${check.isCorrect ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
              </div>
              <div>
                <h4 className="text-slate-800 dark:text-slate-200 font-medium text-sm mb-1">{check.claim}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs">{check.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sources */}
      {result.sources.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-display text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">{t('verificationSources')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.sources.map((source, i) => (
              <a
                key={i}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-100/50 dark:bg-slate-800/30 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-lg flex items-center gap-3 group transition-all"
              >
                <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-all">
                  <i className="fas fa-link text-xs"></i>
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white truncate">{source.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultView;
