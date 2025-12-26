// Lazy getter for cookieSecret to ensure dotenv is loaded first
function getCookieSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length === 0) {
    console.error('[ENV] JWT_SECRET is not set in environment variables');
    console.error('[ENV] process.env.JWT_SECRET:', process.env.JWT_SECRET);
    throw new Error("JWT_SECRET is not configured. Please set JWT_SECRET in your environment variables.");
  }
  return secret;
}

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  get cookieSecret() {
    return getCookieSecret();
  },
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
