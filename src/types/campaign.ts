export type ArcResolution = 'cliffhanger' | 'finale';

export interface ArcProgressSummaryEvent {
  id: string;
  headline: string;
  subhead: string;
  summary: string;
  typeLabel: string;
}

export type ArcProgressStatus = 'advanced' | 'cliffhanger' | 'finale';

export interface ArcProgressSummary {
  arcId: string;
  arcName: string;
  chapter: number;
  totalChapters: number;
  progressPercent: number;
  resolution?: ArcResolution;
  status: ArcProgressStatus;
  tagline: string;
  events: ArcProgressSummaryEvent[];
}
