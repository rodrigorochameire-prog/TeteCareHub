import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { createClient } from "@supabase/supabase-js";
import { getUserByAuthId, upsertUserFromSupabase, getUserByOpenId, getUserById, getUserByEmail } from "../db";
import { COOKIE_NAME } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";

// Lazy initialization to allow dotenv to load first
let supabaseAdmin: ReturnType<typeof createClient> | null = null;
let sdkInstance: any = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    // Load environment variables lazily (after dotenv has loaded)
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        `Missing Supabase environment variables. VITE_SUPABASE_URL: ${supabaseUrl ? "OK" : "MISSING"}, SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? "OK" : "MISSING"}`
      );
    }
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdmin;
}

async function getSDK() {
  if (!sdkInstance) {
    const { sdk } = await import("./sdk");
    sdkInstance = sdk;
  }
  return sdkInstance;
}

// Supabase admin client will be created lazily via getSupabaseAdmin()

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Method 1: Try Supabase Bearer token (for Supabase Auth)
    const authHeader = opts.req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      // Verify token with Supabase
      const {
        data: { user: supabaseUser },
        error,
      } = await getSupabaseAdmin().auth.getUser(token);

      if (!error && supabaseUser) {
        // Sync user to our database
        await upsertUserFromSupabase(supabaseUser);

        // Get user from our database
        const foundUser = await getUserByAuthId(supabaseUser.id);
        if (foundUser) {
          return {
            req: opts.req,
            res: opts.res,
            user: foundUser,
          };
        }
      }
    }

    // Method 2: Try JWT session cookie (for email/password login)
    const cookies = parseCookieHeader(opts.req.headers.cookie || "");
    const sessionCookie = cookies[COOKIE_NAME];

    console.log('[createContext] Cookie check:', {
      hasCookie: !!sessionCookie,
      cookieName: COOKIE_NAME,
      allCookies: Object.keys(cookies),
      cookiePreview: sessionCookie ? `${sessionCookie.substring(0, 20)}...` : 'none'
    });

    if (sessionCookie) {
      const sdk = await getSDK();
      const session = await sdk.verifySession(sessionCookie);

      console.log('[createContext] Session verification:', {
        hasSession: !!session,
        sessionOpenId: session?.openId,
        sessionAppId: session?.appId,
        sessionName: session?.name
      });

      if (session) {
        const sessionOpenId = session.openId;
        
        // Try to find user by open_id first
        let foundUser: User | null = null;
        try {
          foundUser = await getUserByOpenId(sessionOpenId);
          console.log('[createContext] User lookup by open_id:', {
            openId: sessionOpenId,
            found: !!foundUser,
            userId: foundUser?.id
          });
        } catch (error: any) {
          console.warn('[createContext] Error looking up by open_id (will try other methods):', error.message);
        }
        
        // If not found by open_id, try by ID (if sessionOpenId is a numeric ID)
        if (!foundUser && /^\d+$/.test(sessionOpenId)) {
          try {
            foundUser = await getUserById(parseInt(sessionOpenId, 10));
            console.log('[createContext] User lookup by ID:', {
              id: sessionOpenId,
              found: !!foundUser
            });
          } catch (error: any) {
            console.warn('[createContext] Error looking up by ID:', error.message);
          }
        }
        
        // If not found by ID, try by auth_id (if sessionOpenId is a UUID)
        if (!foundUser && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionOpenId)) {
          try {
            foundUser = await getUserByAuthId(sessionOpenId);
            console.log('[createContext] User lookup by auth_id:', {
              authId: sessionOpenId,
              found: !!foundUser
            });
          } catch (error: any) {
            console.warn('[createContext] Error looking up by auth_id:', error.message);
          }
        }
        
        // If not found by auth_id, try by email (last resort)
        if (!foundUser && sessionOpenId.includes("@")) {
          try {
            foundUser = await getUserByEmail(sessionOpenId);
            console.log('[createContext] User lookup by email:', {
              email: sessionOpenId,
              found: !!foundUser
            });
          } catch (error: any) {
            console.warn('[createContext] Error looking up by email:', error.message);
          }
        }

        if (foundUser) {
          console.log('[createContext] User found, returning authenticated context');
          return {
            req: opts.req,
            res: opts.res,
            user: foundUser,
          };
        } else {
          // If database is unavailable but session is valid, create a temporary user object
          // This allows the app to work even when the database is temporarily unavailable
          console.warn('[createContext] Session valid but user not found in database. Database may be unavailable. Creating temporary user object.');
          
          // Create a temporary user object from session data
          const tempUser: User = {
            id: 0,
            open_id: sessionOpenId,
            auth_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionOpenId) ? sessionOpenId : null,
            name: session.name || "User",
            email: sessionOpenId.includes("@") ? sessionOpenId : null,
            login_method: "email",
            email_verified: false,
            role: "user",
            phone: null,
            stripe_customer_id: null,
            created_at: new Date(),
            updated_at: new Date(),
            last_signed_in: new Date(),
          } as User;
          
          console.log('[createContext] Returning temporary user object');
          return {
            req: opts.req,
            res: opts.res,
            user: tempUser,
          };
        }
      } else {
        console.warn('[createContext] Session cookie present but verification failed');
      }
    } else {
      console.log('[createContext] No session cookie found');
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    // If we have a valid session but database is unavailable, create temporary user
    console.warn("[Auth] Error authenticating request:", error);
    
    // Try to get session from cookie even if database lookup failed
    try {
      const cookies = parseCookieHeader(opts.req.headers.cookie || "");
      const sessionCookie = cookies[COOKIE_NAME];
      
      if (sessionCookie) {
        const sdk = await getSDK();
        const session = await sdk.verifySession(sessionCookie);
        
        if (session) {
          console.log('[createContext] Database unavailable but session valid, creating temporary user');
          const tempUser: User = {
            id: 0,
            open_id: session.openId,
            auth_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session.openId) ? session.openId : null,
            name: session.name || "User",
            email: session.openId.includes("@") ? session.openId : null,
            login_method: "email",
            email_verified: false,
            role: "user",
            phone: null,
            stripe_customer_id: null,
            created_at: new Date(),
            updated_at: new Date(),
            last_signed_in: new Date(),
          } as User;
          
          return {
            req: opts.req,
            res: opts.res,
            user: tempUser,
          };
        }
      }
    } catch (sessionError) {
      console.warn("[Auth] Could not create temporary user from session:", sessionError);
    }
    
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
