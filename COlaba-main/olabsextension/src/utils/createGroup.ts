'use client';

import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import {auth,db} from "../firebase/firebase";

export async function createGroup(
  groupName: string, 
  subject: string, 
  experimentDetails: string
): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const groupRef = await addDoc(collection(db, "groups"), {
      name: groupName,
      subject,
      experimentDetails,
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      creatorName: user.displayName || user.email || 'Anonymous',
      members: [user.uid],
      membersCount: 1
    });

    await addDoc(collection(db, `groups/${groupRef.id}/members`), {
      uid: user.uid,
      displayName: user.displayName || user.email || 'Anonymous',
      email: user.email,
      photoURL: user.photoURL || null,
      joinedAt: serverTimestamp(),
      role: 'admin', 
      online: true
    });

    return groupRef.id;
  } catch (error) {
    console.error("Error creating group:", error);
    throw error; 
  }
}
