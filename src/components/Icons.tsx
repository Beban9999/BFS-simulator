/** Small stroke icons (24×24 viewBox). Decorative: callers provide accessible labels. */
const paths = {
  play: <path d="M7 4.5v15l12-7.5z" fill="currentColor" stroke="none" />,
  pause: (
    <>
      <rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" />
      <rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" />
    </>
  ),
  stepBack: <path d="M18 5 9 12l9 7V5zM6 5v14" />,
  stepForward: <path d="M6 5l9 7-9 7V5zM18 5v14" />,
  first: <path d="M19 5 12 12l7 7M12 5 5 12l7 7" />,
  last: <path d="M5 5l7 7-7 7M12 5l7 7-7 7" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </>
  ),
  moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  popout: <path d="M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
  dock: <path d="M4 4h16v16H4zM4 15h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  dice: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="9" cy="9" r="1.2" fill="currentColor" />
      <circle cx="15" cy="15" r="1.2" fill="currentColor" />
      <circle cx="15" cy="9" r="1.2" fill="currentColor" />
      <circle cx="9" cy="15" r="1.2" fill="currentColor" />
    </>
  ),
  edit: <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />,
  link: <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />,
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  minus: <path d="M5 12h14" />,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <path d="M5 7h14M10 11v6M14 11v6M7 7l1 12h8l1-12M9 7V4h6v3" />,
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v5H5V6h5" />,
};

export type IconName = keyof typeof paths;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}

/** Steplore mark: a grid where the search path traces an "S" (public/favicon.svg). */
export function Logo() {
  return <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={28} height={28} />;
}
