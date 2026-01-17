import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

export const addUserPoints = async (userId, pointsToAdd) => {
  try {
    const pointsRef = doc(db, "points", userId);
    await updateDoc(pointsRef, {
      stars: increment(pointsToAdd)
    });
    return true;
  } catch (error) {
    console.error("Error updating user points:", error);
    return false;
  }
};