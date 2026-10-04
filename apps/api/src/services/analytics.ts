import fs from 'node:fs';
import path from 'node:path';

export interface ActivityItem {
  id: string;
  timestamp: string;
  wordCount: number;
  characterCount: number;
  language: string;
  label: string;
  aiLikelihood: number;
  confidence: number;
  processingTimeMs: number;
  tellsCount: number;
}

export interface AnalyticsData {
  startedAt: string;
  lastActiveAt: string;
  totalVisitors: number;
  uniqueVisitorsCount: number;
  totalAnalyses: number;
  totalWords: number;
  totalCharacters: number;
  classifications: {
    human_likely: number;
    ai_likely: number;
    ai_edited_likely: number;
    inconclusive: number;
  };
  languages: Record<string, number>;
  topTells: Record<string, number>;
  dailyActivity: Record<string, { analyses: number; words: number; aiLikelyCount: number }>;
  recentActivity: ActivityItem[];
}

class AnalyticsService {
  private data: AnalyticsData;
  private uniqueVisitorHashes: Set<string>;
  private dataFilePath: string;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.dataFilePath = path.join(process.cwd(), 'data', 'analytics.json');
    this.uniqueVisitorHashes = new Set<string>();

    this.data = {
      startedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      totalVisitors: 0,
      uniqueVisitorsCount: 0,
      totalAnalyses: 0,
      totalWords: 0,
      totalCharacters: 0,
      classifications: {
        human_likely: 0,
        ai_likely: 0,
        ai_edited_likely: 0,
        inconclusive: 0,
      },
      languages: {
        en: 0,
        ar: 0,
      },
      topTells: {},
      dailyActivity: {},
      recentActivity: [],
    };

    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
      }
    } catch (err) {
      console.warn('[Analytics] Could not load stored analytics, using in-memory state.', err);
    }
  }

  private scheduleSave() {
    if (this.saveTimeout) return;
    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null;
      try {
        const dir = path.dirname(this.dataFilePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(this.dataFilePath, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (err) {
        console.warn('[Analytics] Failed to persist analytics to disk:', err);
      }
    }, 1500);
  }

  public recordVisit(visitorId?: string) {
    this.data.totalVisitors++;
    this.data.lastActiveAt = new Date().toISOString();

    if (visitorId) {
      if (!this.uniqueVisitorHashes.has(visitorId)) {
        this.uniqueVisitorHashes.add(visitorId);
        this.data.uniqueVisitorsCount++;
      }
    } else {
      if (this.data.uniqueVisitorsCount === 0) {
        this.data.uniqueVisitorsCount = 1;
      }
    }

    this.scheduleSave();
  }

  public recordAnalysis(params: {
    wordCount: number;
    characterCount: number;
    language: string;
    label: string;
    aiLikelihood: number;
    confidence: number;
    processingTimeMs: number;
    tells?: Array<{ rule?: string; type?: string; explanation?: string }>;
  }) {
    const now = new Date();
    const dateKey = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const timestamp = now.toISOString();

    this.data.totalAnalyses++;
    this.data.totalWords += params.wordCount || 0;
    this.data.totalCharacters += params.characterCount || 0;
    this.data.lastActiveAt = timestamp;

    // Classification counts
    const labelKey = params.label as keyof typeof this.data.classifications;
    if (labelKey in this.data.classifications) {
      this.data.classifications[labelKey]++;
    } else {
      this.data.classifications.inconclusive++;
    }

    // Language counts
    const lang = (params.language || 'unknown').toLowerCase();
    this.data.languages[lang] = (this.data.languages[lang] || 0) + 1;

    // Daily activity
    if (!this.data.dailyActivity[dateKey]) {
      this.data.dailyActivity[dateKey] = { analyses: 0, words: 0, aiLikelyCount: 0 };
    }
    this.data.dailyActivity[dateKey].analyses++;
    this.data.dailyActivity[dateKey].words += params.wordCount || 0;
    if (params.label === 'ai_likely' || params.label === 'ai_edited_likely') {
      this.data.dailyActivity[dateKey].aiLikelyCount++;
    }

    // Top tells
    if (Array.isArray(params.tells)) {
      for (const tell of params.tells) {
        const ruleName = tell.rule || tell.type || 'AI Rhetorical Pattern';
        this.data.topTells[ruleName] = (this.data.topTells[ruleName] || 0) + 1;
      }
    }

    // Recent activity (capped at 50 entries, no sensitive text stored!)
    const activityItem: ActivityItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp,
      wordCount: params.wordCount,
      characterCount: params.characterCount,
      language: lang,
      label: params.label,
      aiLikelihood: Math.round(params.aiLikelihood * 100),
      confidence: Math.round(params.confidence * 100),
      processingTimeMs: Math.round(params.processingTimeMs),
      tellsCount: params.tells?.length || 0,
    };

    this.data.recentActivity.unshift(activityItem);
    if (this.data.recentActivity.length > 50) {
      this.data.recentActivity = this.data.recentActivity.slice(0, 50);
    }

    this.scheduleSave();
  }

  public getStats(): AnalyticsData {
    return {
      ...this.data,
      uniqueVisitorsCount: Math.max(this.data.uniqueVisitorsCount, this.uniqueVisitorHashes.size),
    };
  }

  public resetStats() {
    this.data = {
      startedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      totalVisitors: 0,
      uniqueVisitorsCount: 0,
      totalAnalyses: 0,
      totalWords: 0,
      totalCharacters: 0,
      classifications: {
        human_likely: 0,
        ai_likely: 0,
        ai_edited_likely: 0,
        inconclusive: 0,
      },
      languages: { en: 0, ar: 0 },
      topTells: {},
      dailyActivity: {},
      recentActivity: [],
    };
    this.uniqueVisitorHashes.clear();
    this.scheduleSave();
  }
}

export const analytics = new AnalyticsService();
