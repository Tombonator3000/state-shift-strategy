import { FXState } from '@/utils/visualEffects';

export const isNewspaperBlocked = (): boolean => FXState.isGlitchActive();
