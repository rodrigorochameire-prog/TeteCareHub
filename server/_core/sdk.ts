import { AXIOS_TIMEOUT_MS, COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import axios, { type AxiosInstance } from "axios";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import type {
  ExchangeTokenRequest,
  ExchangeTokenResponse,
  GetUserInfoResponse,
  GetUserInfoWithJwtRequest,
  GetUserInfoWithJwtResponse,
} from "./types/manusTypes";

// Utility function
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

const EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
const GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
const GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;

class OAuthService {
  constructor(private client: ReturnType<typeof axios.create>) {
    // OAuth is optional - only log if configured
    if (ENV.oAuthServerUrl) {
      console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    }
  }

  private decodeState(state: string): string {
    const redirectUri = atob(state);
    return redirectUri;
  }

  async getTokenByCode(
    code: string,
    state: string
  ): Promise<ExchangeTokenResponse> {
    const payload: ExchangeTokenRequest = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state),
    };

    const { data } = await this.client.post<ExchangeTokenResponse>(
      EXCHANGE_TOKEN_PATH,
      payload
    );

    return data;
  }

  async getUserInfoByToken(
    token: ExchangeTokenResponse
  ): Promise<GetUserInfoResponse> {
    const { data } = await this.client.post<GetUserInfoResponse>(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken,
      }
    );

    return data;
  }
}

const createOAuthHttpClient = (): AxiosInstance => {
  if (!ENV.oAuthServerUrl) {
    // Return a mock client that throws helpful errors
    return {
      post: async () => {
        throw new Error("OAuth is not configured. This feature requires OAUTH_SERVER_URL to be set.");
      },
      get: async () => {
        throw new Error("OAuth is not configured. This feature requires OAUTH_SERVER_URL to be set.");
      },
    } as any;
  }
  return axios.create({
    baseURL: ENV.oAuthServerUrl,
    timeout: AXIOS_TIMEOUT_MS,
  });
};

class SDKServer {
  private readonly client: AxiosInstance;
  private readonly oauthService: OAuthService;

  constructor(client: AxiosInstance = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }

  private deriveLoginMethod(
    platforms: unknown,
    fallback: string | null | undefined
  ): string | null {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set<string>(
      platforms.filter((p): p is string => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (
      set.has("REGISTERED_PLATFORM_MICROSOFT") ||
      set.has("REGISTERED_PLATFORM_AZURE")
    )
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }

  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(
    code: string,
    state: string
  ): Promise<ExchangeTokenResponse> {
    return this.oauthService.getTokenByCode(code, state);
  }

  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken: string): Promise<GetUserInfoResponse> {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken,
    } as ExchangeTokenResponse);
    const loginMethod = this.deriveLoginMethod(
      (data as any)?.platforms,
      (data as any)?.platform ?? data.platform ?? null
    );
    return {
      ...(data as any),
      platform: loginMethod,
      loginMethod,
    } as GetUserInfoResponse;
  }

  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  private getSessionSecret() {
    // Read directly from process.env to ensure we get the latest value
    const secret = process.env.JWT_SECRET || ENV.cookieSecret;
    
    console.log('[getSessionSecret] JWT_SECRET check:', {
      hasSecret: !!secret,
      secretLength: secret?.length || 0,
      secretPreview: secret ? `${secret.substring(0, 10)}...` : 'empty',
      processEnvJWT: process.env.JWT_SECRET ? `${process.env.JWT_SECRET.substring(0, 10)}...` : 'NOT SET',
      envCookieSecret: ENV.cookieSecret ? `${ENV.cookieSecret.substring(0, 10)}...` : 'EMPTY'
    });
    
    if (!secret || secret.length === 0) {
      console.error('[getSessionSecret] JWT_SECRET is empty or not set');
      console.error('[getSessionSecret] process.env.JWT_SECRET:', process.env.JWT_SECRET);
      console.error('[getSessionSecret] ENV.cookieSecret:', ENV.cookieSecret);
      throw new Error("JWT_SECRET is not configured. Please set JWT_SECRET in your environment variables.");
    }
    return new TextEncoder().encode(secret);
  }

  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(
    openId: string,
    options: { expiresInMs?: number; name?: string } = {}
  ): Promise<string> {
    // Ensure appId is not empty - use a default if ENV.appId is empty
    const appId = ENV.appId || "tete-house-hub";
    const name = options.name || "User";
    
    const payload = {
      openId,
      appId,
      name,
    };
    
    console.log('[createSessionToken] Creating token with payload:', {
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name,
      appIdLength: payload.appId.length,
      nameLength: payload.name.length,
      ENV_appId: ENV.appId || 'EMPTY'
    });
    
    return this.signSession(payload, options);
  }

  async signSession(
    payload: SessionPayload,
    options: { expiresInMs?: number } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<{ openId: string; appId: string; name: string } | null> {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      
      console.log('[verifySession] JWT payload:', {
        hasPayload: !!payload,
        payloadKeys: Object.keys(payload || {}),
        openId: (payload as any)?.openId,
        appId: (payload as any)?.appId,
        name: (payload as any)?.name,
        fullPayload: JSON.stringify(payload, null, 2)
      });
      
      const { openId, appId, name } = payload as Record<string, unknown>;

      if (
        !isNonEmptyString(openId) ||
        !isNonEmptyString(appId) ||
        !isNonEmptyString(name)
      ) {
        console.warn("[Auth] Session payload missing required fields", {
          openId: (typeof openId === 'string' && openId) ? `${openId.substring(0, 20)}...` : 'MISSING',
          appId: (typeof appId === 'string' && appId) ? `${appId.substring(0, 20)}...` : 'MISSING',
          name: (typeof name === 'string' && name) ? `${name.substring(0, 20)}...` : 'MISSING',
          openIdType: typeof openId,
          appIdType: typeof appId,
          nameType: typeof name,
          openIdLength: typeof openId === 'string' ? openId.length : 0,
          appIdLength: typeof appId === 'string' ? appId.length : 0,
          nameLength: typeof name === 'string' ? name.length : 0
        });
        return null;
      }

      return {
        openId,
        appId,
        name,
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }

  async getUserInfoWithJwt(
    jwtToken: string
  ): Promise<GetUserInfoWithJwtResponse> {
    const payload: GetUserInfoWithJwtRequest = {
      jwtToken,
      projectId: ENV.appId,
    };

    const { data } = await this.client.post<GetUserInfoWithJwtResponse>(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );

    const loginMethod = this.deriveLoginMethod(
      (data as any)?.platforms,
      (data as any)?.platform ?? data.platform ?? null
    );
    return {
      ...(data as any),
      platform: loginMethod,
      loginMethod,
    } as GetUserInfoWithJwtResponse;
  }

  async authenticateRequest(req: Request): Promise<User> {
    // Regular authentication flow
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    const sessionUserId = session.openId;
    const signedInAt = new Date();
    let user = await db.getUserByOpenId(sessionUserId);

    // If user not in DB, sync from OAuth server automatically
    if (!user) {
      try {
        let userInfo: Partial<GetUserInfoWithJwtResponse> = {};
        try {
          // Try to fetch latest info from remote auth server
          userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        } catch (remoteError) {
          console.warn("[Auth] Warning: Could not fetch detailed user info from remote:", remoteError);
        }

        // FALLBACK LOGIC:
        // If remote fetch fails, rely on session data (verified via JWT)
        const finalOpenId = userInfo.openId || sessionUserId;
        const finalName = userInfo.name || session.name || "Unknown User";

        if (!finalOpenId) {
             throw new Error("Critical: No openId available even from session.");
        }

        // DATABASE SYNC:
        await db.upsertUser({
          open_id: finalOpenId,
          name: finalName,
          email: userInfo.email ?? null,
          // FIX: Default to "email" if loginMethod is missing/null to prevent DB error
          login_method: userInfo.loginMethod ?? userInfo.platform ?? "email",
          last_signed_in: signedInAt,
        });
        
        user = await db.getUserByOpenId(finalOpenId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }

    if (!user) {
      throw ForbiddenError("User not found after sync attempt");
    }

    await db.upsertUser({
      open_id: user.open_id,
      last_signed_in: signedInAt,
    });

    return user;
  }
}

// Initialize SDK - OAuth is optional, methods will fail gracefully if not configured
export const sdk = new SDKServer();
