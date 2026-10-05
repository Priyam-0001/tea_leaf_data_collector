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

            set({
                session,
                initialized: true,
                isLoading: false,
            });

            supabase.auth.onAuthStateChange((_event, session) => {
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
            const { data, error } =
                await supabase.auth.signUp({
                    email: email.trim(),
                    password,
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