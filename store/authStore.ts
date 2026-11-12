import { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@/database/supabase';

interface AuthState {
    session: Session | null;
    isLoading: boolean;
    initialized: boolean;

    initialize: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    verifySignupOtp: (email: string, token: string) => Promise<void>;
    resendSignupOtp: (email: string) => Promise<void>;
    sendSignInOtp: (email: string) => Promise<void>;
    verifySignInOtp: (email: string, token: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    session: null,
    isLoading: true,
    initialized: false,

    initialize: async () => {
        try {
            const {
                data: { session },
                error,
            } = await supabase.auth.getSession();

            if (error) {
                throw error;
            }

            const isConfirmed = !!(
                session?.user?.email_confirmed_at ||
                session?.user?.confirmed_at
            );

            set({
                session: (session && isConfirmed) ? session : null,
                initialized: true,
                isLoading: false,
            });

            supabase.auth.onAuthStateChange((_event, session) => {
                // If user is unconfirmed, do not auto-login until verified
                const isConfirmed = !!(
                    session?.user?.email_confirmed_at ||
                    session?.user?.confirmed_at
                );

                if (session && !isConfirmed) {
                    set({ session: null });
                    return;
                }

                set({
                    session,
                });
            });
        } catch (error) {
            console.error(
                'Authentication initialization failed:',
                error
            );

            set({
                session: null,
                initialized: true,
                isLoading: false,
            });
        }
    },

    signIn: async (email, password) => {
        set({ isLoading: true });

        try {
            const { data, error } =
                await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                });

            if (error) {
                throw error;
            }

            const isConfirmed = !!(
                data.session?.user?.email_confirmed_at ||
                data.session?.user?.confirmed_at
            );

            if (!isConfirmed) {
                // Instantly kill the session if email is unconfirmed
                await supabase.auth.signOut();
                set({ session: null, isLoading: false });
                throw new Error('Email not confirmed. Please verify your email first.');
            }

            set({
                session: data.session,
                isLoading: false,
            });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    signUp: async (email, password) => {
        set({ isLoading: true });

        try {
            const { error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
            });

            if (error) {
                throw error;
            }

            // Explicitly keep session null so the user is NOT redirected away
            // and must verify their 6-digit email OTP first!
            set({
                session: null,
                isLoading: false,
            });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    verifySignupOtp: async (email, token) => {
        set({ isLoading: true });

        try {
            // First try 'signup' verification type
            let { data, error } = await supabase.auth.verifyOtp({
                email: email.trim(),
                token: token.trim(),
                type: 'signup',
            });

            // If 'signup' fails, fallback to 'email' (handles both config modes in Supabase)
            if (error) {
                const secondTry = await supabase.auth.verifyOtp({
                    email: email.trim(),
                    token: token.trim(),
                    type: 'email',
                });
                if (secondTry.error) {
                    throw error;
                }
                data = secondTry.data;
            }

            let activeSession = data.session;
            if (!activeSession) {
                const { data: sessionData } = await supabase.auth.getSession();
                activeSession = sessionData.session;
            }

            set({
                session: activeSession,
                isLoading: false,
            });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    resendSignupOtp: async (email) => {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email.trim(),
        });

        if (error) {
            throw error;
        }
    },

    sendSignInOtp: async (email) => {
        set({ isLoading: true });

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: email.trim(),
                options: {
                    shouldCreateUser: false, // only existing registered users can sign in with code
                },
            });

            if (error) {
                throw error;
            }

            set({ isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    verifySignInOtp: async (email, token) => {
        set({ isLoading: true });

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email: email.trim(),
                token: token.trim(),
                type: 'email',
            });

            if (error) {
                throw error;
            }

            set({
                session: data.session,
                isLoading: false,
            });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    signOut: async () => {
        set({ isLoading: true });

        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            set({
                session: null,
                isLoading: false,
            });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    resetPassword: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(
            email.trim()
        );

        if (error) {
            throw error;
        }
    },
}));
