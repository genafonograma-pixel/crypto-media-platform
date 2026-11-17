import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * ScrollToTop
 * Scrolls the window to the top on every push/replace navigation.
 * Does NOT scroll when:
 *   - The user hits Back/Forward (NavigationType === "POP")
 *   - Only the query string changed and the pathname is the same
 *   - A hash anchor is present (let the browser handle it)
 */
export default function ScrollToTop() {
  const { pathname, hash, search } = useLocation();
  const navType = useNavigationType();
  const prevPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    // Back / Forward — let the browser restore the previous scroll position
    if (navType === 'POP') {
      prevPathnameRef.current = pathname;
      return;
    }

    // Hash anchor — let the browser scroll to the element
    if (hash) {
      prevPathnameRef.current = pathname;
      return;
    }

    // Only the query string changed on the same page — don't scroll
    if (pathname === prevPathnameRef.current) {
      return;
    }

    // Push / Replace to a new pathname — scroll to top instantly
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Focus the main landmark so keyboard/screen-reader users are oriented
    const main = document.getElementById('main');
    if (main) {
      main.focus({ preventScroll: true });
    }

    prevPathnameRef.current = pathname;
  // search is intentionally NOT in the dep array — we don't want to re-run when
  // only the query string changes on the same pathname.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hash, navType]);

  return null;
}
