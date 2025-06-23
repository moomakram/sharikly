import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();
client
  .setEndpoint('http://localhost/v1') // رابط Appwrite المحلي
  .setProject('YOUR_PROJECT_ID'); // استبدل بـ Project ID الخاص بك

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
