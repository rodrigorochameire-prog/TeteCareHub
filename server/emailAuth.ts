/**
 * Email/Password Authentication Module
 * Uses Supabase Auth SDK for all authentication operations
 */

import { createClient } from '@supabase/supabase-js';
import { getUserByAuthId, upsertUser, getUserByEmail, getDb, getUserById } from './db';
import { users, passwordResetTokens, emailVerificationTokens } from '../drizzle/schema';
import { eq, and, gt } from 'drizzle-orm';
import crypto from 'crypto';

// Cliente Supabase com service role key (acesso admin)
// Criado de forma lazy para garantir que variáveis de ambiente estejam carregadas
function getSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      `Missing Supabase environment variables. VITE_SUPABASE_URL: ${supabaseUrl ? "OK" : "MISSING"}, SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? "OK" : "MISSING"}`
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin";
}

/**
 * Login usando Supabase Auth
 */
export async function loginWithEmail(email: string, password: string) {
  try {
    console.log('[loginWithEmail] Attempting login for:', email);
    
    const supabase = getSupabaseClient();
    const normalizedEmail = email.toLowerCase().trim();
    
    // 1. Autenticar via Supabase Auth SDK
    console.log('[loginWithEmail] Calling Supabase signInWithPassword...');
    let { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });
    
    if (error) {
      console.error('[loginWithEmail] Supabase Auth error:', error.message);
      console.error('[loginWithEmail] Error code:', error.status);
      console.error('[loginWithEmail] Full error:', JSON.stringify(error, null, 2));
      
      // Verificar se existe no banco local para diagnóstico
      const localUser = await getUserByEmail(normalizedEmail);
      console.log('[loginWithEmail] Local user check:', {
        exists: !!localUser,
        hasAuthId: !!localUser?.auth_id,
        authId: localUser?.auth_id,
        emailVerified: localUser?.email_verified
      });
      
      // Tratar erro específico de email não confirmado
      if (error.message.includes('Email not confirmed') || 
          error.message.includes('email_not_confirmed') ||
          error.status === 400 && error.message.toLowerCase().includes('confirm')) {
        console.log('[loginWithEmail] Email not confirmed - attempting to confirm automatically...');
        // Verificar se podemos confirmar automaticamente via admin API
        if (localUser && localUser.auth_id) {
          try {
            console.log('[loginWithEmail] Attempting to confirm email via admin API...');
            const { error: confirmError } = await supabase.auth.admin.updateUserById(
              localUser.auth_id,
              { email_confirm: true }
            );
            
            if (!confirmError) {
              console.log('[loginWithEmail] Email confirmed via admin API, retrying login...');
              // Tentar login novamente após confirmar
              const retryResult = await supabase.auth.signInWithPassword({
                email: normalizedEmail,
                password
              });
              
              if (!retryResult.error && retryResult.data?.user) {
                console.log('[loginWithEmail] Login successful after email confirmation');
                // Usar os dados do retry para continuar
                data = retryResult.data;
                error = null;
                // Continuar com o fluxo normal abaixo
              } else {
                console.error('[loginWithEmail] Retry login failed after email confirmation:', retryResult.error?.message);
                return null;
              }
            } else {
              console.error('[loginWithEmail] Failed to confirm email:', confirmError.message);
              return null;
            }
          } catch (confirmErr: any) {
            console.error('[loginWithEmail] Error confirming email:', confirmErr.message);
            return null;
          }
        } else {
          console.log('[loginWithEmail] Cannot auto-confirm: user not found locally or missing auth_id');
          return null;
        }
      }
      
      // Se ainda há erro após tentar confirmar email, tratar outros erros
      if (error) {
        // Se o erro for "Invalid login credentials" ou similar
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('User not found') ||
            error.message.includes('Invalid login')) {
          
          if (localUser && !localUser.auth_id) {
            console.log('[loginWithEmail] User exists locally but not in Supabase Auth. User needs to register first.');
            return null;
          }
          
          if (localUser && localUser.auth_id) {
            console.log('[loginWithEmail] User has auth_id but Supabase login failed.');
            console.log('[loginWithEmail] Possible causes: wrong password, email not confirmed, or account disabled');
            console.log('[loginWithEmail] Auth ID:', localUser.auth_id);
          }
        }
        
        return null;
      }
    }
    
    if (!data.user) {
      console.error('[loginWithEmail] No user returned from auth');
      return null;
    }
    
    console.log('[loginWithEmail] Auth successful, user ID:', data.user.id);
    
    // 2. Buscar dados adicionais em public.users
    let user = await getUserByAuthId(data.user.id);
    
    // 3. Se não existir em public.users, criar automaticamente
    if (!user) {
      console.log('[loginWithEmail] User not found in public.users, creating...');
      
      try {
        const userId = await upsertUser({
          auth_id: data.user.id,
          email: data.user.email!,
          name: data.user.email!.split('@')[0],
          role: 'user',
          login_method: 'email',
          email_verified: data.user.email_confirmed_at ? true : false,
          // Set open_id to auth_id so it can be found by session token
          open_id: data.user.id
        });
        
        if (userId) {
          user = await getUserById(userId);
          // Ensure open_id is set for session lookup
          if (user && !user.open_id) {
            await upsertUser({
              id: user.id,
              open_id: data.user.id
            });
            user = await getUserById(userId);
          }
        } else {
          // Se upsertUser retornou null (banco não disponível), buscar novamente
          user = await getUserByAuthId(data.user.id);
        }
      } catch (dbError: any) {
        console.error('[loginWithEmail] Error creating user in database:', dbError.message);
        // Se o banco não estiver disponível, ainda podemos permitir o login
        // usando os dados do Supabase Auth
        console.warn('[loginWithEmail] Database unavailable, using Supabase Auth data only');
      }
    } else {
      // Ensure open_id is set for existing users
      if (!user.open_id && user.auth_id) {
        console.log('[loginWithEmail] Setting open_id for existing user');
        await upsertUser({
          id: user.id,
          open_id: user.auth_id
        });
        user = await getUserById(user.id) || await getUserByAuthId(data.user.id);
      }
    }
    
    // 4. Se ainda não temos user (banco não disponível), criar objeto temporário
    if (!user) {
      console.log('[loginWithEmail] Database unavailable, creating temporary user object');
      // Criar um objeto de usuário temporário baseado nos dados do Supabase
      // Isso permite o login mesmo quando o banco não está disponível
      user = {
        id: 0, // ID temporário - será atualizado quando o banco estiver disponível
        auth_id: data.user.id,
        email: data.user.email!,
        name: data.user.email!.split('@')[0],
        role: 'user' as const,
        login_method: 'email' as const,
        email_verified: data.user.email_confirmed_at ? true : false,
        open_id: null,
        phone: null,
        stripe_customer_id: null,
        created_at: new Date(),
        updated_at: new Date(),
        last_signed_in: new Date(),
      } as any;
    } else {
      // 5. Atualizar último login (se banco estiver disponível)
      const db = await getDb();
      if (db && user.id) {
        try {
          await db.update(users)
            .set({ last_signed_in: new Date() })
            .where(eq(users.id, user.id));
        } catch (updateError: any) {
          console.warn('[loginWithEmail] Failed to update last_signed_in:', updateError.message);
          // Não falhar o login se não conseguir atualizar
        }
      }
    }
    
    console.log('[loginWithEmail] Login complete for:', user?.email);
    return user;
    
  } catch (error: any) {
    console.error('[loginWithEmail] Unexpected error:', error.message);
    console.error('[loginWithEmail] Stack:', error.stack);
    return null;
  }
}

/**
 * Alias para compatibilidade com código existente
 */
export async function loginUser(input: LoginInput) {
  const user = await loginWithEmail(input.email, input.password);
  if (!user) {
    throw new Error("Invalid email or password");
  }
  return {
    id: user.id,
    email: user.email || input.email.toLowerCase(),
    name: user.name || "",
    role: user.role,
  };
}

/**
 * Criar nova conta via Supabase Auth
 */
export async function signupWithEmail(
  email: string, 
  password: string, 
  name: string
) {
  try {
    console.log('[signupWithEmail] Creating account for:', email);
    
    const supabase = getSupabaseClient();
    
    // 1. Criar usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: {
          name
        }
      }
    });
    
    if (error) {
      console.error('[signupWithEmail] Supabase Auth error:', error.message);
      throw error;
    }
    
    if (!data.user) {
      throw new Error('No user returned from signup');
    }
    
    console.log('[signupWithEmail] Auth user created:', data.user.id);
    
    // 2. Criar registro em public.users
    let userId: number | null = null;
    
    try {
      userId = await upsertUser({
        auth_id: data.user.id,
        email: data.user.email!,
        name: name,
        role: 'user',
        login_method: 'email',
        email_verified: false
      });
      
      if (userId) {
        console.log('[signupWithEmail] User record created in database, ID:', userId);
      } else {
        console.warn('[signupWithEmail] upsertUser returned null ID');
      }
    } catch (upsertError: any) {
      console.error('[signupWithEmail] Error creating user record:', upsertError.message);
      console.error('[signupWithEmail] Upsert error stack:', upsertError.stack);
      // Continue to try to find user
    }
    
    // 3. Buscar o usuário criado
    let user = null;
    
    if (userId) {
      // Se temos o ID, buscar diretamente por ID
      try {
        user = await getUserById(userId);
        console.log('[signupWithEmail] User found by ID:', userId);
      } catch (error: any) {
        console.warn('[signupWithEmail] Error getting user by ID:', error.message);
      }
    }
    
    // Se não encontrou por ID, tentar por auth_id
    if (!user) {
      user = await getUserByAuthId(data.user.id);
      if (user) {
        console.log('[signupWithEmail] User found by auth_id');
      }
    }
    
    // Se ainda não encontrou, tentar buscar por email
    if (!user) {
      console.log('[signupWithEmail] User not found by auth_id, trying by email...');
      user = await getUserByEmail(data.user.email!);
      if (user) {
        console.log('[signupWithEmail] User found by email');
      }
    }
    
    // Se ainda não encontrou, tentar criar novamente
    if (!user) {
      console.error('[signupWithEmail] User not found after creation. Auth ID:', data.user.id);
      console.error('[signupWithEmail] Attempting to create user record again...');
      
      try {
        userId = await upsertUser({
          auth_id: data.user.id,
          email: data.user.email!,
          name: name,
          role: 'user',
          login_method: 'email',
          email_verified: false
        });
        
        if (userId) {
          user = await getUserById(userId);
        }
        
        if (!user) {
          await new Promise(resolve => setTimeout(resolve, 300));
          user = await getUserByAuthId(data.user.id);
        }
        
        if (!user) {
          user = await getUserByEmail(data.user.email!);
        }
      } catch (retryError: any) {
        console.error('[signupWithEmail] Retry failed:', retryError.message);
      }
    }
    
    if (!user || !user.id) {
      const errorMsg = `Failed to create user record in database. Auth ID: ${data.user.id}, Email: ${data.user.email}, UserId from upsert: ${userId}`;
      console.error('[signupWithEmail]', errorMsg);
      throw new Error(errorMsg);
    }
    
    console.log('[signupWithEmail] Signup complete, user ID:', user.id);
    
    return user;
    
  } catch (error: any) {
    console.error('[signupWithEmail] Error:', error.message);
    throw error;
  }
}

/**
 * Alias para compatibilidade com código existente
 */
export async function registerUser(input: RegisterInput) {
  console.log('[registerUser] Starting registration for:', input.email);
  
  const user = await signupWithEmail(input.email, input.password, input.name);
  
  console.log('[registerUser] signupWithEmail returned:', {
    hasUser: !!user,
    userId: user?.id,
    email: user?.email
  });
  
  if (!user) {
    console.error('[registerUser] signupWithEmail returned null/undefined');
    throw new Error("Failed to create user account - no user returned");
  }
  
  if (!user.id || user.id === 0) {
    console.error('[registerUser] Invalid user ID:', user.id);
    console.error('[registerUser] User object:', JSON.stringify(user, null, 2));
    throw new Error(`Failed to create user account - invalid user ID: ${user.id}`);
  }
  
  const result = {
    id: user.id,
    email: user.email || input.email.toLowerCase(),
    name: user.name || input.name,
    role: input.role || user.role || "user",
  };
  
  console.log('[registerUser] Returning user with ID:', result.id);
  
  return result;
}

/**
 * Create user directly in Supabase Auth using admin API
 * Useful for creating users without email confirmation requirement
 */
export async function createUserInSupabase(
  email: string,
  password: string,
  name: string,
  emailVerified: boolean = true
) {
  try {
    console.log('[createUserInSupabase] Creating user:', email);
    
    const supabase = getSupabaseClient();
    
    // Check if user already exists
    const existingUser = await getUserByEmail(email.toLowerCase());
    if (existingUser && existingUser.auth_id) {
      console.log('[createUserInSupabase] User already exists in database');
      return existingUser;
    }
    
    // Create user using admin API (no email confirmation needed)
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: emailVerified,
      user_metadata: {
        name
      }
    });
    
    if (error) {
      // If user already exists in Supabase Auth, try to get it
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        console.log('[createUserInSupabase] User already exists in Supabase Auth, attempting to link...');
        // Try to sign in to get the user ID
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password
        });
        
        if (signInData?.user) {
          await upsertUser({
            auth_id: signInData.user.id,
            email: email.toLowerCase(),
            name: name,
            role: 'user',
            login_method: 'email',
            email_verified: emailVerified || !!signInData.user.email_confirmed_at
          });
          
          return await getUserByAuthId(signInData.user.id);
        }
      }
      
      console.error('[createUserInSupabase] Supabase Admin error:', error.message);
      throw error;
    }
    
    if (!data.user) {
      throw new Error('No user returned from admin createUser');
    }
    
    console.log('[createUserInSupabase] Auth user created:', data.user.id);
    
    // Create/update record in public.users
    await upsertUser({
      auth_id: data.user.id,
      email: data.user.email!,
      name: name,
      role: 'user',
      login_method: 'email',
      email_verified: emailVerified || !!data.user.email_confirmed_at
    });
    
    const user = await getUserByAuthId(data.user.id);
    console.log('[createUserInSupabase] User creation complete');
    
    return user;
    
  } catch (error: any) {
    console.error('[createUserInSupabase] Error:', error.message);
    throw error;
  }
}

/**
 * Trocar senha (requer autenticação)
 */
export async function changePassword(
  userId: number,
  oldPassword: string,
  newPassword: string
) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get user
    const userResults = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = userResults.length > 0 ? userResults[0] : null;

    if (!user || !user.auth_id) {
      throw new Error("User not found or not using Supabase Auth");
    }

    const supabase = getSupabaseClient();

    // First, verify the old password by attempting to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email || "",
      password: oldPassword,
    });

    if (verifyError) {
      throw new Error("Current password is incorrect");
    }

    // Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.auth_id,
      { password: newPassword }
    );
    
    if (updateError) {
      console.error('[changePassword] Error:', updateError.message);
      throw new Error("Failed to update password");
    }
    
    console.log('[changePassword] Password updated for user:', user.auth_id);
    return { success: true };
    
  } catch (error: any) {
    console.error('[changePassword] Unexpected error:', error.message);
    throw error;
  }
}

/**
 * Verificar se email existe
 */
export async function emailExists(email: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .limit(1);
    
    return data && data.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Generate a password reset token
 */
export async function generateResetToken(email: string) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const supabase = getSupabaseClient();
    const normalizedEmail = email.toLowerCase().trim();

    // Use Supabase Auth to send password reset email
    // This will send an email with a reset link automatically
    const { data, error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${process.env.VITE_APP_URL || process.env.APP_URL || 'http://localhost:3000'}/reset-password`,
    });

    if (error) {
      console.error('[generateResetToken] Supabase Auth error:', error.message);
      // Don't reveal if email exists or not for security
      // Return success even if there's an error to prevent email enumeration
      return { success: true };
    }

    console.log('[generateResetToken] Password reset email sent to:', normalizedEmail);

    // Also find user and create token in our database for tracking
    const user = await getUserByEmail(normalizedEmail);
    if (user && user.id) {
      try {
        // Generate random token for our tracking system
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save token to our database for tracking
        await db.insert(passwordResetTokens).values({
          user_id: user.id,
          token,
          expires_at: expiresAt,
        });

        console.log('[generateResetToken] Token saved to database for user:', user.id);
      } catch (tokenError: any) {
        // Don't fail if token creation fails - Supabase already sent the email
        console.warn('[generateResetToken] Failed to save token to database:', tokenError.message);
      }
    }

    // Always return success to prevent email enumeration
    return { success: true };
  } catch (error: any) {
    console.error('[generateResetToken] Error:', error.message);
    console.error('[generateResetToken] Stack:', error.stack);
    // Don't reveal internal errors to user
    return { success: true };
  }
}

/**
 * Reset password using token via Supabase Auth
 */
export async function resetPassword(token: string, newPassword: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Find valid token in our database
  const tokenResults = await db.select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false),
        gt(passwordResetTokens.expires_at, new Date())
      )
    )
    .limit(1);

  const resetToken = tokenResults.length > 0 ? tokenResults[0] : null;

  if (!resetToken) {
    throw new Error("Invalid or expired reset token");
  }

  // Get user
  const userResults = await db.select().from(users).where(eq(users.id, resetToken.user_id)).limit(1);
  const user = userResults.length > 0 ? userResults[0] : null;

  if (!user || !user.auth_id) {
    throw new Error("User not found or not using Supabase Auth");
  }

  const supabase = getSupabaseClient();

  // Update password in Supabase Auth
  const { error: updateError } = await supabase.auth.admin.updateUserById(user.auth_id, {
    password: newPassword,
  });

  if (updateError) {
    console.error("[resetPassword] Failed to update password:", updateError.message);
    throw new Error("Failed to reset password");
  }

  // Mark token as used
  await db.update(passwordResetTokens)
    .set({ used: true })
    .where(eq(passwordResetTokens.id, resetToken.id));

  return { success: true };
}

/**
 * Generate an email verification token
 */
export async function generateVerificationToken(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Generate random token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Save token to database
  await db.insert(emailVerificationTokens).values({
    user_id: userId,
    token,
    expires_at: expiresAt,
  });

  return { token };
}

/**
 * Verify email using token
 */
export async function verifyEmail(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Find valid token
  const tokenResults = await db.select()
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.token, token),
        eq(emailVerificationTokens.used, false),
        gt(emailVerificationTokens.expires_at, new Date())
      )
    )
    .limit(1);

  const verificationToken = tokenResults.length > 0 ? tokenResults[0] : null;

  if (!verificationToken) {
    throw new Error("Invalid or expired verification token");
  }

  // Update user email verified status
  await db.update(users)
    .set({ email_verified: true })
    .where(eq(users.id, verificationToken.user_id));

  // Mark token as used
  await db.update(emailVerificationTokens)
    .set({ used: true })
    .where(eq(emailVerificationTokens.id, verificationToken.id));

  return { success: true };
}
