import { GameCard } from '@/types/cardTypes';

// Add GameEvent import
interface GameEvent {
  id: string;
  title: string;
  headline?: string;
  content: string;
  type: 'conspiracy' | 'government' | 'truth' | 'random' | 'crisis' | 'opportunity' | 'capture';
  faction?: 'truth' | 'government' | 'neutral';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  effects?: {
    truth?: number;
    ip?: number;
    cardDraw?: number;
  };
  flavorText?: string;
}

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
    console.log('📰 loadConfig called, current config:', !!this.config);
    if (this.config) return this.config;
    
    try {
      console.log('📰 Fetching newspaper config from /data/newspaper.config.json');
      const response = await fetch('/data/newspaper.config.json');
      if (!response.ok) {
        console.error('📰 Config fetch failed:', response.status, response.statusText);
        throw new Error('Config not found');
      }
      this.config = await response.json();
      this.initialized = true;
      console.log('📰 Config loaded successfully:', {
        mastheads: this.config.mastheads.length,
        ads: this.config.ads.length,
        templates: this.config.headlineTemplates.length
      });
      return this.config;
    } catch (error) {
      console.warn('📰 Failed to load newspaper config, using fallback:', error);
      // Fallback config
      this.config = {
        mastheads: [{ name: "The Paranoid Post" }, { name: "Weekly World Whoa!" }],
        ads: [{ title: "Buy Tinfoil Hats!", body: "Mind protection guaranteed" }],
        headlineTemplates: [
          { type: "GENERIC", faction: "Any", templates: ["{CARD}!"] }
        ],
        sidebars: ["Strange things happen"],
        tickers: ["Breaking: Something occurred"],
        editorialStamps: ["BREAKING!"]
      };
      this.initialized = true;
      console.log('📰 Fallback config initialized');
      return this.config;
    }
  }

  queueArticleFromCard(card: GameCard, context: RoundContext): void {
    console.log('📰 queueArticleFromCard called:', card.name, 'initialized:', this.initialized);
    if (!this.initialized) {
      console.warn('📰 Newspaper system not initialized, cannot queue card article');
      return;
    }

    const article = this.generateArticleFromCard(card, context);
    this.queuedArticles.push(article);
    console.log('📰 Card article queued for:', card.name, 'Total queued articles:', this.queuedArticles.length);
  }

  queueArticleFromEvent(event: GameEvent, context: RoundContext): void {
    console.log('📰 queueArticleFromEvent called:', event.title, 'initialized:', this.initialized);
    if (!this.initialized) {
      console.warn('📰 Newspaper system not initialized, cannot queue event article');
      return;
    }

    const article = this.generateArticleFromEvent(event, context);
    this.queuedArticles.push(article);
    console.log('📰 Event article queued for:', event.title, 'Total queued articles:', this.queuedArticles.length);
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
    
    // What happened - MORE SPECIFIC TO CARD
    paragraphs.push(`Breaking news from the field: ${card.name} has been activated with unprecedented results. Witnesses report ${this.getCardSpecificEffect(card)} occurring across multiple sectors.`);
    
    // Who was affected - USE ACTUAL CARD EFFECTS
    const effectValue = this.extractValue(card);
    paragraphs.push(`Initial reports suggest ${effectValue}% of the target population experienced the effects of ${card.name}. ${this.getOfficialDenial(card)}`);
    
    // Expert quote (parodic) - REFERENCE THE ACTUAL CARD
    const expertQuotes = [
      `"The deployment of ${card.name} changes everything we thought we knew about ${this.getCardTheme(card)}," claims Dr. [REDACTED] from the Institute of Anomalous Studies.`,
      `"The readings from ${card.name} are completely off the charts," whispers a scientist who requested anonymity.`,
      `"I predicted ${card.name} would surface in my newsletter three months ago," boasts conspiracy researcher Rex Tinfoilson.`
    ];
    paragraphs.push(expertQuotes[Math.floor(Math.random() * expertQuotes.length)]);
    
    // Follow-up hint
    if (Math.random() > 0.5) {
      paragraphs.push(`More details about ${card.name} expected in tomorrow's classified briefing. (Continued on page [REDACTED])`);
    }
    
    return paragraphs;
  }

  private getCardSpecificEffect(card: GameCard): string {
    if (card.effects?.truthDelta) {
      return card.effects.truthDelta > 0 ? 'reality distortions' : 'truth suppression events';
    }
    if (card.effects?.ipDelta?.self) {
      return card.effects.ipDelta.self > 0 ? 'influence amplification' : 'power dampening';
    }
    if (card.type === 'ZONE') return 'territorial anomalies';
    if (card.type === 'MEDIA') return 'information cascade events';
    return 'unexplained phenomena';
  }

  private getOfficialDenial(card: GameCard): string {
    const denials = [
      `"We can neither confirm nor deny the existence of ${card.name}," stated a spokesperson.`,
      `Officials dismissed reports of ${card.name} as "weather balloon incidents."`,
      `The Department of Normal Affairs issued a statement: "${card.name} never happened."`,
      `"Citizens should remain calm regarding ${card.name}," advised local authorities.`
    ];
    return denials[Math.floor(Math.random() * denials.length)];
  }

  private getCardTheme(card: GameCard): string {
    if (card.faction === 'truth') return 'disclosure operations';
    if (card.faction === 'government') return 'classified protocols';
    if (card.type === 'ZONE') return 'territorial control';
    if (card.type === 'MEDIA') return 'information warfare';
    return 'conspiracy theory';
  }

  private generateArticleFromEvent(event: GameEvent, context: RoundContext): QueuedArticle {
    const headline = event.headline || event.title.toUpperCase();
    const dek = this.generateEventDek(event);
    const body = this.generateEventBody(event, context);
    const stamp = this.pickRandomStamp();

    return {
      cardId: `event-${event.id}`,
      title: headline,
      dek,
      body,
      imageUrl: this.getEventImage(event),
      stamp
    };
  }

  private generateEventDek(event: GameEvent): string {
    if (event.flavorText) {
      return event.flavorText.length > 80 ? event.flavorText.substring(0, 77) + '...' : event.flavorText;
    }

    const eventDekTemplates = [
      'Breaking developments unfold in real time',
      'Experts scramble to understand implications', 
      'Government response expected within hours',
      'Citizens advised to remain vigilant',
      'Investigation teams deployed nationwide'
    ];
    
    return eventDekTemplates[Math.floor(Math.random() * eventDekTemplates.length)];
  }

  private generateEventBody(event: GameEvent, context: RoundContext): string[] {
    const paragraphs = [];
    
    // Use the event's actual content as first paragraph
    paragraphs.push(event.content);
    
    // Add context about effects
    if (event.effects) {
      let effectText = 'Sources report ';
      const effects = [];
      if (event.effects.truth) effects.push(`${Math.abs(event.effects.truth)}% shift in public awareness`);
      if (event.effects.ip) effects.push(`${Math.abs(event.effects.ip)} point influence change`);
      if (event.effects.cardDraw) effects.push('classified intelligence surfacing');
      
      if (effects.length > 0) {
        effectText += effects.join(' and ') + '.';
        paragraphs.push(effectText);
      }
    }
    
    // Add expert commentary based on event type
    const commentaries = {
      'conspiracy': 'Conspiracy researchers claim this validates years of investigation into shadow operations.',
      'government': 'Official channels maintain this is part of routine administrative procedures.',
      'truth': 'Truth advocacy groups herald this as a breakthrough in transparency efforts.',
      'crisis': 'Emergency response protocols have been activated across multiple agencies.',
      'opportunity': 'Strategic analysts suggest this development creates new possibilities.'
    };
    
    const commentary = commentaries[event.type as keyof typeof commentaries] || 'Independent observers continue monitoring the situation.';
    paragraphs.push(commentary);
    
    return paragraphs;
  }

  private getEventImage(event: GameEvent): string {
    // Map event types to appropriate placeholder images
    const eventImages = {
      'conspiracy': '/img/classified-placeholder.png',
      'government': '/img/classified-placeholder.png', 
      'truth': '/img/classified-placeholder.png',
      'crisis': '/img/classified-placeholder.png',
      'opportunity': '/img/classified-placeholder.png'
    };
    
    return eventImages[event.type as keyof typeof eventImages] || '/img/classified-placeholder.png';
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
    console.log('📰 Article headlines:', articles.map(a => a.title).join(', '));
    
    // Generate ticker for overflow BEFORE clearing queue
    const overflowArticles = this.queuedArticles.slice(4);
    const ticker = this.generateTicker(overflowArticles);
    
    // Clear queue AFTER using it
    this.queuedArticles = [];
    
    // Split articles into main and side
    const mainArticles = articles.slice(0, 3);
    const sideArticle = articles[3];
    
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
    
    console.log('📰 Created newspaper issue with', mainArticles.length, 'main articles featuring cards:', 
      mainArticles.map(a => a.title).join(' | '));
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