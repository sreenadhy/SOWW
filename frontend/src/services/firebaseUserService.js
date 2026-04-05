import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirestoreDb } from './firebaseApp';

const USERS_COLLECTION = 'users';

function getUserDocument(userId) {
  return doc(getFirestoreDb(), USERS_COLLECTION, userId);
}

function mapFirestoreError(error) {
  switch (error?.code) {
    case 'failed-precondition':
      return 'Firestore Database is not created yet. Create Firestore Database in Firebase Console.';
    case 'permission-denied':
      return 'Firestore permission denied. Update your Firestore rules.';
    case 'unavailable':
      return 'Unable to reach Firestore right now. Check your internet and Firebase setup.';
    default:
      if (String(error?.message || '').toLowerCase().includes('offline')) {
        return 'Unable to reach Firestore right now. Create Firestore Database and check your connection.';
      }

      return error?.message || 'Unable to connect to Firestore right now.';
  }
}

export async function getUserProfile(userId) {
  let snapshot;

  try {
    snapshot = await getDoc(getUserDocument(userId));
  } catch (error) {
    throw new Error(mapFirestoreError(error));
  }

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,
    name: data.name || '',
    email: data.email || '',
    phoneNumber: data.phoneNumber || '',
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || null,
  };
}

export async function createUserProfile({ userId, phoneNumber, name, email }) {
  const trimmedName = name?.trim();
  const trimmedEmail = email?.trim() || '';
  const userDoc = getUserDocument(userId);

  try {
    await setDoc(
      userDoc,
      {
        name: trimmedName,
        email: trimmedEmail,
        phoneNumber,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    throw new Error(mapFirestoreError(error));
  }

  return {
    id: userId,
    name: trimmedName,
    email: trimmedEmail,
    phoneNumber,
  };
}
