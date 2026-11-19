export interface NavSport {
  href: string;
  label: string;
  inMore?: boolean;
}

export const SPORTS_NAV: NavSport[] = [
  { href: '/football-news', label: 'Football' },
  { href: '/news/american-football', label: 'NFL' },
  { href: '/news/basketball', label: 'Basketball' },
  { href: '/news/tennis', label: 'Tennis' },
  { href: '/news/formula1', label: 'Formula 1' },
  { href: '/news/rugby', label: 'Rugby', inMore: true },
  { href: '/news/horse-racing', label: 'Horse racing', inMore: true },
  { href: '/news', label: 'All sports', inMore: true },
  { href: '/quiz', label: '⚽ Logo Quiz', inMore: true },
];
