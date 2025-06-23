import { account } from './appwrite';

/** تسجيل الدخول */
export async function login(email, password) {
  try {
    const session = await account.createEmailSession(email, password);
    return session;
  } catch (error) {
    throw new Error('Unauthorized');
  }
}

/** تسجيل الخروج */
export async function logout() {
  await account.deleteSession('current');
}
