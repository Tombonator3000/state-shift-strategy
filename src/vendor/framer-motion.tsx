import { forwardRef, useEffect, useMemo, useRef, useState, type ComponentPropsWithoutRef, type CSSProperties, type ReactNode } from 'react';

type MotionStyle = {
  opacity?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  x?: number;
  y?: number;
};

type TransitionConfig = {
  duration?: number;
  ease?: string;
  delay?: number;
};

type MotionProps<T extends keyof JSX.IntrinsicElements> = ComponentPropsWithoutRef<T> & {
  initial?: MotionStyle;
  animate?: MotionStyle;
  exit?: MotionStyle;
  transition?: TransitionConfig;
};

const easeMap: Record<string, string> = {
  easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

const toCssStyle = (style?: MotionStyle): CSSProperties => {
  if (!style) return {};
  const css: CSSProperties = {};
  const transforms: string[] = [];
  if (typeof style.scale === 'number') transforms.push(`scale(${style.scale})`);
  if (typeof style.scaleX === 'number') transforms.push(`scaleX(${style.scaleX})`);
  if (typeof style.scaleY === 'number') transforms.push(`scaleY(${style.scaleY})`);
  if (typeof style.x === 'number' || typeof style.y === 'number') {
    const x = style.x ?? 0;
    const y = style.y ?? 0;
    transforms.push(`translate(${x}px, ${y}px)`);
  }
  if (typeof style.opacity === 'number') {
    css.opacity = style.opacity;
  }
  if (transforms.length > 0) {
    css.transform = transforms.join(' ');
  }
  return css;
};

function createMotionComponent<T extends keyof JSX.IntrinsicElements>(tag: T) {
  type Props = MotionProps<T>;
  const MotionComponent = forwardRef<HTMLElement, Props>((props, ref) => {
    const { initial, animate, transition, style, children, ...rest } = props as MotionProps<any>;
    const [currentStyle, setCurrentStyle] = useState<CSSProperties>(() => ({ ...toCssStyle(initial) }));
    const transitionStyle = useMemo(() => {
      const duration = transition?.duration ?? 0.2;
      const delay = transition?.delay ?? 0;
      const ease = transition?.ease ? easeMap[transition.ease] ?? transition.ease : 'ease-out';
      return { transition: `all ${duration}s ${ease}`, transitionDelay: `${delay}s` };
    }, [transition?.duration, transition?.delay, transition?.ease]);

    const mountedRef = useRef(false);

    useEffect(() => {
      if (!mountedRef.current) {
        mountedRef.current = true;
        requestAnimationFrame(() => setCurrentStyle(prev => ({ ...prev, ...toCssStyle(animate) })));
        return;
      }
      setCurrentStyle(prev => ({ ...prev, ...toCssStyle(animate) }));
    }, [animate]);

    const TagComponent: any = tag;
    return (
      <TagComponent
        {...rest}
        ref={ref}
        style={{
          ...transitionStyle,
          ...style,
          ...currentStyle,
        }}
      >
        {children}
      </TagComponent>
    );
  });
  MotionComponent.displayName = `motion.${String(tag)}`;
  return MotionComponent;
}

const motion = {
  div: createMotionComponent('div'),
  span: createMotionComponent('span'),
  button: createMotionComponent('button'),
  aside: createMotionComponent('aside'),
};

interface AnimatePresenceProps {
  children: ReactNode;
}

const AnimatePresence = ({ children }: AnimatePresenceProps) => <>{children}</>;

export { motion, AnimatePresence };
