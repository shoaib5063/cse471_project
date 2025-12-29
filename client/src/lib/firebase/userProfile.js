import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';

export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const createUserProfile = async (userId, profileData) => {
  let firestoreSuccess = false;
  let mongoSuccess = false;

  // 1. Write to Firestore
  try {
    console.log('Attempting to write to Firestore for user:', userId);
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, {
      ...profileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log('Successfully wrote to Firestore');
    firestoreSuccess = true;
  } catch (error) {
    console.error('Error writing to Firestore:', error);
    // Return early if Firestore fails? Or try MongoDB anyway? 
    // Usually auth depends on Firestore profile, so we should probably fail.
    return { success: false, error: 'Firestore write failed: ' + error.message };
  }

  // 2. Sync with Backend (MongoDB)
  try {
    console.log('Attempting to sync with MongoDB...');
    await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firebaseUid: userId,
        email: profileData.email,
        name: profileData.name
      }),
    });
    console.log('Successfully synced with MongoDB');
    mongoSuccess = true;
  } catch (error) {
    console.error('Error syncing with MongoDB:', error);
    // We don't fail the whole process if backend sync fails, 
    // but we might want to alert the user or log it.
    // For now, we proceed since Firestore is the primary source of truth for the client.
  }

  return { success: true, firestore: firestoreSuccess, mongo: mongoSuccess };
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
};
