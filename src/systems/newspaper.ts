import { GameCard } from '@/types/cardTypes';

export interface QueuedArticle {
  cardId: string;
  title: string;
  dek?: string;
  body: string[];
  imageUrl?: string;
  stamp?: string;
}

export interface NewspaperIssue {
  masthead: string;
  volume: number;
  date: string;
  mainArticles: QueuedArticle[];
  sideArticle?: QueuedArticle;
  ticker: string[];
  ads: FakeAd[];
  sidebar?: string;
  isGlitchEdition: boolean;
}

interface FakeAd {
  title: string;
  body?: string;
  kicker?: string;
  footer?: string;
}

interface NewspaperConfig {
  mastheads: { name: string; weight?: number }[];
  ads: FakeAd[];
  headlineTemplates: {
    type: string;
    faction: string;
    templates: string[];
  }[];
  sidebars?: string[];
  tickers?: string[];
  editorialStamps?: string[];
}

interface RoundContext {
  round: number;
  truth: number;
  ip: { human: number; ai: number };
  states?: any[];
}

class NewspaperSystem {
  private config: NewspaperConfig | null = null;
  private queuedArticles: QueuedArticle[] = [];
  private usedMastheads: string[] = [];
  private initialized = false;

  async loadConfig(): Promise<NewspaperConfig> {
    if (this.config) return this.config;
    
    try {
      const response = await fetch('/data/newspaper.config.json');
      if (!response.ok) throw new Error('Config not found');
      this.config = await response.json();
      this.initialized = true;
      return this.config;
    } catch (error) {
      console.warn('Failed to load newspaper config, using fallback');
      // Fallback config
      this.config = {
        mastheads: [{ name: "The Paranoid Post" }],
        ads: [{ title: "Buy Tinfoil Hats!", body: "Mind protection guaranteed" }],
        headlineTemplates: [
          { type: "GENERIC", faction: "Any", templates: ["{CARD}!"] }
        ],
        sidebars: ["Strange things happen"],
        tickers: ["Breaking: Something occurred"],
        editorialStamps: ["BREAKING!"]
      };
      this.initialized = true;
      return this.config;
    }
  }

  queueArticleFromCard(card: GameCard, context: RoundContext): void {
    console.log('📰 queueArticleFromCard called:', card.name, 'initialized:', this.initialized);
    if (!this.initialized) {
      console.warn('Newspaper system not initialized');
      return;
    }

    const article = this.generateArticleFromCard(card, context);
    this.queuedArticles.push(article);
    console.log('📰 Article queued. Total queued:', this.queuedArticles.length);
  }

  private generateArticleFromCard(card: GameCard, context: RoundContext): QueuedArticle {
    const headline = this.generateHeadline(card, context);
    const dek = this.generateDek(card);
    const body = this.generateBody(card, context);
    const stamp = this.pickRandomStamp();

    return {
      cardId: card.id,
      title: headline,
      dek,
      body,
      imageUrl: this.getCardImage(card),
      stamp
    };
  }

  private generateHeadline(card: GameCard, context: RoundContext): string {
    if (!this.config) return card.name.toUpperCase();

    // Find matching template
    const templates = this.config.headlineTemplates.find(t => 
      (t.type === card.type || t.type === 'GENERIC') &&
      (t.faction === card.faction || t.faction === 'Any')
    );

    if (!templates || templates.templates.length === 0) {
      return `${card.name.toUpperCase()}!`;
    }

    const template = templates.templates[Math.floor(Math.random() * templates.templates.length)];
    
    return this.fillTemplate(template, card, context);
  }

  private fillTemplate(template: string, card: GameCard, context: RoundContext): string {
    let result = template;
    
    result = result.replace(/{CARD}/g, card.name.toUpperCase());
    result = result.replace(/{EFFECT}/g, this.summarizeEffects(card));
    result = result.replace(/{PLACE}/g, this.choosePlaceFromTarget(card));
    result = result.replace(/{TARGET}/g, this.summarizeTarget(card));
    result = result.replace(/{VALUE}/g, this.extractValue(card).toString());
    
    return result;
  }

  private summarizeEffects(card: GameCard): string {
    if (!card.effects) return 'UNKNOWN EFFECTS';
    
    const effects = [];
    if (card.effects.truthDelta) effects.push('TRUTH SHIFT');
    if (card.effects.ipDelta) effects.push('INFLUENCE');
    if (card.effects.draw) effects.push('INTEL');
    if (card.effects.zoneDefense) effects.push('PROTECTION');
    
    return effects.length > 0 ? effects[0] : 'ANOMALY';
  }

  private choosePlaceFromTarget(card: GameCard): string {
    const places = [
      'AREA 51', 'ROSWELL', 'DENVER AIRPORT', 'WASHINGTON DC',
      'FLORIDA', 'NEVADA', 'ANTARCTICA', 'THE MOON', 'UNDERGROUND'
    ];
    return places[Math.floor(Math.random() * places.length)];
  }

  private summarizeTarget(card: GameCard): string {
    if (!card.target) return 'CITIZENS';
    
    switch (card.target.scope) {
      case 'global': return 'ENTIRE POPULATION';
      case 'state': return 'LOCAL RESIDENTS';
      case 'controlled': return 'CONTROLLED ZONES';
      case 'contested': return 'DISPUTED TERRITORIES';
      default: return 'TARGETS';
    }
  }

  private extractValue(card: GameCard): number {
    if (card.effects?.truthDelta) return Math.abs(card.effects.truthDelta);
    if (card.effects?.ipDelta?.self) return Math.abs(card.effects.ipDelta.self);
    if (card.effects?.draw) return card.effects.draw;
    return Math.floor(Math.random() * 50) + 10;
  }

  private generateDek(card: GameCard): string {
    // Use flavor text if available
    if (card.flavorTruth || card.flavorGov) {
      const flavor = card.flavorTruth || card.flavorGov;
      return flavor.length > 80 ? flavor.substring(0, 77) + '...' : flavor;
    }

    // Fallback editorial voice
    const dekTemplates = [
      'Sources confirm unprecedented development',
      'Experts remain baffled by latest findings',
      'Government officials refuse to comment',
      'Witnesses describe strange phenomena',
      'Investigation continues behind closed doors'
    ];
    
    return dekTemplates[Math.floor(Math.random() * dekTemplates.length)];
  }

  private generateBody(card: GameCard, context: RoundContext): string[] {
    const paragraphs = [];
    
    // What happened
    paragraphs.push(`Reports flooded in today as ${card.name} was deployed across multiple locations. Eyewitnesses describe scenes of [REDACTED] and unexplained phenomena.`);
    
    // Who was affected
    paragraphs.push(`The operation affected an estimated ${this.extractValue(card)} percent of the target population. "I can't discuss specifics," said one anonymous official, "but the implications are... significant."`);
    
    // Expert quote (parodic)
    const expertQuotes = [
      '"This changes everything we thought we knew," claims Dr. [REDACTED] from the Institute of Anomalous Studies.',
      '"The readings are off the charts," whispers a scientist who requested anonymity.',
      '"I predicted this in my newsletter three months ago," boasts conspiracy researcher Rex Tinfoilson.'
    ];
    paragraphs.push(expertQuotes[Math.floor(Math.random() * expertQuotes.length)]);
    
    // Follow-up hint
    if (Math.random() > 0.5) {
      paragraphs.push('Stay tuned for further developments. (More on page [CLASSIFIED])');
    }
    
    return paragraphs;
  }

  private getCardImage(card: GameCard): string {
    // Use card image if available, otherwise classified placeholder
    return card.id ? `/card-art/${card.id}.png` : '/img/classified-placeholder.png';
  }

  private pickRandomStamp(): string {
    if (!this.config?.editorialStamps) return 'BREAKING!';
    const stamps = this.config.editorialStamps;
    return stamps[Math.floor(Math.random() * stamps.length)];
  }

  flushForRound(round: number): NewspaperIssue {
    console.log('📰 flushForRound called for round:', round, 'queued articles:', this.queuedArticles.length);
    if (!this.config) throw new Error('Config not loaded');
    
    const isGlitchEdition = Math.random() < 0.05; // 5% chance
    const masthead = this.chooseMasthead(isGlitchEdition);
    const articles = [...this.queuedArticles].slice(0, 4); // Max 4 articles
    
    console.log('📰 Creating issue with masthead:', masthead, 'articles:', articles.length);
    
    // Clear queue
    this.queuedArticles = [];
    
    // Split articles into main and side
    const mainArticles = articles.slice(0, 3);
    const sideArticle = articles[3];
    
    // Generate ticker for overflow
    const overflowArticles = this.queuedArticles.slice(4);
    const ticker = this.generateTicker(overflowArticles);
    
    const issue = {
      masthead,
      volume: round,
      date: this.getCurrentDate(),
      mainArticles,
      sideArticle,
      ticker,
      ads: this.pickFakeAds(3),
      sidebar: this.pickSidebar(),
      isGlitchEdition
    };
    
    console.log('📰 Created newspaper issue:', issue);
    return issue;
  }

  private chooseMasthead(isGlitch: boolean): string {
    if (!this.config) return 'THE PARANOID POST';
    
    let candidates = this.config.mastheads.filter(m => 
      !this.usedMastheads.includes(m.name)
    );
    
    if (candidates.length === 0) {
      this.usedMastheads = [];
      candidates = this.config.mastheads;
    }
    
    if (isGlitch) {
      const glitchNames = [
        'THE SHEEPLE DAILY', 'AREA 51 LEDGER', 'MIND CONTROL WEEKLY',
        'GLITCH GAZETTE', 'ERROR 404 NEWS'
      ];
      return glitchNames[Math.floor(Math.random() * glitchNames.length)];
    }
    
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    this.usedMastheads.push(chosen.name);
    
    return chosen.name;
  }

  private pickFakeAds(count: number): FakeAd[] {
    if (!this.config?.ads) return [];
    
    const shuffled = [...this.config.ads].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  private pickSidebar(): string | undefined {
    if (!this.config?.sidebars) return undefined;
    return this.config.sidebars[Math.floor(Math.random() * this.config.sidebars.length)];
  }

  private generateTicker(overflowArticles: QueuedArticle[]): string[] {
    const ticker = [];
    
    // Add overflow headlines
    overflowArticles.forEach(article => {
      ticker.push(`BREAKING: ${article.title}`);
    });
    
    // Add random ticker items
    if (this.config?.tickers) {
      const randomTickers = this.config.tickers
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      ticker.push(...randomTickers);
    }
    
    return ticker;
  }

  private getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

// Export singleton instance
export const newspaper = new NewspaperSystem();