import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Server-side safe initial value
    if (typeof window === 'undefined') return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      console.log('🔍 Mobile Detection:', { width: window.innerWidth, isMobile: mobile, breakpoint: MOBILE_BREAKPOINT });
      setIsMobile(mobile);
    };
    
    mql.addEventListener("change", onChange);
    
    // Initial check
    const initialMobile = window.innerWidth < MOBILE_BREAKPOINT;
    console.log('🔍 Initial Mobile Detection:', { width: window.innerWidth, isMobile: initialMobile, breakpoint: MOBILE_BREAKPOINT });
    setIsMobile(initialMobile);
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}