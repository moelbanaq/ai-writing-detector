import React from 'react';

interface TextStatisticsProps {
  stats: {
    words?: number;
    sentences?: number;
    paragraphs?: number;
    averageSentenceLength?: number;
    typeTokenRatio?: number;
    wordCount?: number;
    sentenceCount?: number;
    paragraphCount?: number;
  };
  language?:
    | {
        primary?: string;
      }
    | string;
}

export function TextStatistics({ stats, language }: TextStatisticsProps) {
  const words = stats?.words ?? stats?.wordCount ?? 0;
  const sentences = stats?.sentences ?? stats?.sentenceCount ?? 0;
  const paragraphs = stats?.paragraphs ?? stats?.paragraphCount ?? 0;
  const avgLen = stats?.averageSentenceLength ?? 0;
  const ttr = stats?.typeTokenRatio ?? 0;
  const langCode = typeof language === 'string' ? language : (language?.primary ?? 'unknown');
  return (
    <div className="card text-statistics">
      <h3>Text Statistics</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Language</div>
          <div style={{ fontWeight: 'bold' }}>{langCode.toUpperCase()}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Words</div>
          <div style={{ fontWeight: 'bold' }}>{words}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Sentences</div>
          <div style={{ fontWeight: 'bold' }}>{sentences}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Paragraphs</div>
          <div style={{ fontWeight: 'bold' }}>{paragraphs}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Avg Sentence Length</div>
          <div style={{ fontWeight: 'bold' }}>{avgLen.toFixed(1)} words</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Lexical Diversity</div>
          <div style={{ fontWeight: 'bold' }}>{(ttr * 100).toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
}
