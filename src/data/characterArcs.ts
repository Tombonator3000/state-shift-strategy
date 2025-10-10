import arcsData from './characterArcs.json';

export interface CharacterArcStageTemplate {
  stage: number;
  title: string;
  summary: string;
  epilogue: string;
}

export interface CharacterArcTemplate {
  name: string;
  stages: CharacterArcStageTemplate[];
}

export type CharacterArcLibrary = Record<string, CharacterArcTemplate>;

export const CHARACTER_ARCS: CharacterArcLibrary = arcsData as CharacterArcLibrary;

export const getCharacterArc = (id: string): CharacterArcTemplate | undefined => {
  if (!id) {
    return undefined;
  }
  return CHARACTER_ARCS[id];
};

export const getCharacterArcStage = (
  id: string,
  stage: number,
): CharacterArcStageTemplate | undefined => {
  const template = getCharacterArc(id);
  if (!template) {
    return undefined;
  }

  const normalizedStage = Math.max(0, stage);
  return (
    template.stages.find(entry => entry.stage === normalizedStage) ??
    template.stages
      .slice()
      .sort((a, b) => a.stage - b.stage)
      .find(entry => entry.stage <= normalizedStage) ??
    template.stages[template.stages.length - 1]
  );
};

export default CHARACTER_ARCS;
