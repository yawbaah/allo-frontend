import { useState, useEffect } from 'react';

/**
 * Custom hook that listens to CSS media query matches.
 * Compatible with React 19 and modern browser matchMedia APIs.
 *
 * @param query CSS media query string (e.g. '(max-width: 768px)')
 * @returns boolean indicating if the media query currently matches
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = (q: string): boolean => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(q).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(() => getMatches(query));

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Ensure state reflects current media query on mount
    setMatches(mediaQueryList.matches);

    // Modern event listener support
    mediaQueryList.addEventListener('change', handleChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Helper hook for mobile viewports (<= 768px)
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

/**
 * Helper hook for tablet & smaller viewports (<= 900px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(max-width: 900px)');
}
