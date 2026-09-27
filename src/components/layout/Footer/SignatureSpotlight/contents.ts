import { githubUsername } from '@/config/constants';

// Where the footer graph gets the maintainer's real GitHub contribution
// calendar. GitHub's own calendar page sends no CORS header and its API needs a
// token, so the browser reads it through this public community proxy, which
// returns the last year as JSON ({ contributions: [{ date, count, level }] }).
// It has no shorter range, so the graph keeps only the most recent days.
export const githubActivityURL: string = `https://github-contributions-api.jogruber.de/v4/${githubUsername}?y=last`;

// How many of the most recent days the graph shows, oldest in the "S" and
// today in the "D".
export const githubActivityDays: number = 30;

// Each visitor's browser keeps the calendar in localStorage for this long, so
// the proxy is called at most once per four hours per browser.
export const githubActivityCacheKey: string = 'github-activity';
export const githubActivityMaxAgeMs: number = 4 * 60 * 60 * 1000;

// Give up on a slow proxy rather than keep a request hanging.
export const githubActivityTimeoutMs: number = 8000;
