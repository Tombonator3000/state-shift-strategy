import { describe, expect, it } from 'bun:test';
import { applyComboThemeToRoot, clearComboThemeFromRoot } from '@/components/game/comboGlitchTheme';
import { ComboThemeMap } from '@/data/combos/themes';

class MockRootElement {
  private classSet = new Set<string>();
  private styleMap = new Map<string, string>();

  classList = {
    add: (...tokens: string[]) => {
      tokens.forEach(token => this.classSet.add(token));
    },
    remove: (...tokens: string[]) => {
      tokens.forEach(token => this.classSet.delete(token));
    },
  } as unknown as DOMTokenList;

  style = {
    setProperty: (key: string, value: string) => {
      this.styleMap.set(key, value);
    },
    removeProperty: (key: string) => {
      this.styleMap.delete(key);
    },
  } as unknown as CSSStyleDeclaration;

  snapshot() {
    return {
      classes: Array.from(this.classSet).sort(),
      styles: Object.fromEntries(Array.from(this.styleMap.entries()).sort()),
    };
  }
}

describe('comboGlitchTheme helpers', () => {
  it('applies, updates, and clears theme tokens', () => {
    const root = new MockRootElement();

    applyComboThemeToRoot({
      root: root as unknown as HTMLElement,
      theme: ComboThemeMap.MEDIA_WAVE,
      durationMs: 1100,
      jitterPx: 1,
      blurPx: 0,
      overlayAlpha: 0.16,
      vignette: false,
      halftone: true,
      previousThemeId: null,
    });

    expect(root.snapshot()).toMatchSnapshot();

    applyComboThemeToRoot({
      root: root as unknown as HTMLElement,
      theme: ComboThemeMap.COVER_OPERATION,
      durationMs: 1500,
      jitterPx: 2,
      blurPx: 1,
      overlayAlpha: 0.2,
      vignette: true,
      halftone: true,
      previousThemeId: ComboThemeMap.MEDIA_WAVE.id,
    });

    expect(root.snapshot()).toMatchSnapshot();

    clearComboThemeFromRoot(root as unknown as HTMLElement, ComboThemeMap.COVER_OPERATION.id);

    expect(root.snapshot()).toMatchSnapshot();
  });
});
