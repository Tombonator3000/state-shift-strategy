import { describe, expect, it } from 'bun:test';
import React from 'react';
import TestRenderer from 'react-test-renderer';
import '@/test/setupLocalStorage';
import CardImage from './CardImage';

const renderCardImage = (props: React.ComponentProps<typeof CardImage>) => {
  let renderer: TestRenderer.ReactTestRenderer;

  TestRenderer.act(() => {
    renderer = TestRenderer.create(<CardImage {...props} />);
  });

  return renderer!;
};

const findSkeletonNode = (renderer: TestRenderer.ReactTestRenderer) => {
  return renderer.root.find(
    node =>
      node.type === 'div' &&
      typeof node.props.className === 'string' &&
      node.props.className.includes('animate-pulse'),
  );
};

describe('CardImage fit modes', () => {
  it('uses object-cover by default', () => {
    const renderer = renderCardImage({ cardId: 'alpha-strike' });

    const container = renderer.root.findByType('div');
    const image = renderer.root.findByType('img');
    const skeleton = findSkeletonNode(renderer);

    expect(container.props.className).toContain('relative overflow-hidden');
    expect(container.props.className).not.toContain('bg-muted/20');
    expect(image.props.className).toContain('object-cover');
    expect(image.props.className).not.toContain('object-contain');
    expect(skeleton.props.className).toContain('bg-muted/20');

    renderer.unmount();
  });

  it('enables containment mode to avoid cropping', () => {
    const renderer = renderCardImage({ cardId: 'beta-signal', fit: 'contain' });

    const container = renderer.root.findByType('div');
    const image = renderer.root.findByType('img');
    const skeleton = findSkeletonNode(renderer);

    expect(container.props.className).toContain('bg-muted/20');
    expect(image.props.className).toContain('object-contain');
    expect(image.props.className).not.toContain('object-cover');
    expect(skeleton.props.className).toContain('bg-muted/30');

    renderer.unmount();
  });

  it('preserves custom sizing classes for varied aspect ratios', () => {
    const aspectClasses = ['aspect-square', 'aspect-[63/88]', 'aspect-video'];

    aspectClasses.forEach((aspectClass, index) => {
      const renderer = renderCardImage({
        cardId: `gamma-${index}`,
        fit: 'contain',
        className: `${aspectClass} w-full`,
      });

      const container = renderer.root.findByType('div');
      expect(container.props.className).toContain(aspectClass);

      const skeleton = findSkeletonNode(renderer);
      expect(skeleton.props.className).toContain('absolute inset-0');

      renderer.unmount();
    });
  });
});
