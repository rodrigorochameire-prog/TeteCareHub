export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// VERSION 5.0 - FORCE VITE RECOMPILE
// This function MUST NEVER create URLs or use URL constructor
// Changed to function declaration to force Vite to recompile
export function getLoginUrl() {
  // Direct return - no variables, no logic, just return
  return "/login";
}
