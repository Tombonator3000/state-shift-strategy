export interface NewsArticle {
  id: string;
  title: string;
  headline: string;
  content: string;
  isEvent: boolean;
  image?: string;
  imageCredit?: string;
  tags?: string[];
  isCard?: boolean;
  player?: 'human' | 'ai';
}
