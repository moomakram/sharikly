import { supabase } from './supabase';

/** تسجيل الدخول */
export async function loginWithRole(email, password, role) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .eq('role', role)
    .single();

  if (error || !data) {
    throw new Error('Unauthorized');
  }

  return data; // بيانات المستخدم
}
