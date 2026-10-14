import { supabase } from '@/database/supabase';

export async function verifyAppLockPassword(
  password: string,
): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke(
    'verify-app-lock',
    {
      body: { password },
    },
  );

  if (error) {
    console.error('App lock verification failed:', error.message);

    throw new Error(
      'Unable to verify the password. Check your connection and try again.',
    );
  }

  return data?.valid === true;
}