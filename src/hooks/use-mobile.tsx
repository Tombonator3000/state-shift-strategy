import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Server-side safe initial value
    if (typeof window === 'undefined') return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
    };

    // Initial check
    checkMobile();
    
    // Use both resize event and matchMedia for comprehensive coverage
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handleChange = () => checkMobile();
    
    window.addEventListener("resize", handleChange);
    mql.addEventListener("change", handleChange);
    
    return () => {
      window.removeEventListener("resize", handleChange);
      mql.removeEventListener("change", handleChange);
    };
  }, []);

  return isMobile;
}