'use client';

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  onSnapshot,
  doc,
  arrayUnion,
  updateDoc,
  serverTimestamp,
  orderBy,
  limit,
  increment,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';

export async function createGroup(groupName, subject, experimentDetails) {
  const user = auth.currentUser;

  // Create a guest user object if no authenticated user
  const guestUser = {
    uid: 'guest-' + Date.now(),
    email: 'guest@colaba.local',
    displayName: 'Guest User'
  };

  const currentUser = user || guestUser;

  try {
    const groupRef = await addDoc(collection(db, "groups"), {
      name: groupName,
      subject,
      experimentDetails,
      createdAt: serverTimestamp(),
      createdBy: currentUser.uid,
      creatorName: currentUser.displayName || currentUser.email || 'Anonymous',
      members: [currentUser.uid],
      membersCount: 1
    });

    await addDoc(collection(db, `groups/${groupRef.id}/members`), {
      uid: currentUser.uid,
      displayName: currentUser.displayName || currentUser.email || 'Anonymous',
      email: currentUser.email,
      photoURL: currentUser.photoURL || null,
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

export function getAvailableGroups(callback, errorCallback) {
  const groupsQuery = query(
    collection(db, "groups"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    groupsQuery,
    (snapshot) => {
      const groups = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      callback(groups);
    },
    (error) => {
      console.error("Error fetching groups:", error);
      if (errorCallback) {
        errorCallback(error);
      }
    }
  );
}

export async function joinGroup(groupId) {
  const user = auth.currentUser;

  // Create a guest user object if no authenticated user
  const guestUser = {
    uid: 'guest-' + Date.now(),
    email: 'guest@colaba.local',
    displayName: 'Guest User'
  };

  const currentUser = user || guestUser;

  const groupRef = doc(db, "groups", groupId);

  try {
    await updateDoc(groupRef, {
      members: arrayUnion(currentUser.uid),
      membersCount: increment(1)
    });

    await addDoc(collection(db, `groups/${groupId}/members`), {
      uid: currentUser.uid,
      displayName: currentUser.displayName || currentUser.email || 'Anonymous',
      email: currentUser.email,
      photoURL: currentUser.photoURL || null,
      joinedAt: serverTimestamp(),
      role: 'member',
      online: true
    });

    return true;
  } catch (error) {
    console.error("Error joining group:", error);
    return false;
  }
}

export function getUserGroups(callback) {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => { };
  }

  const groupsQuery = query(
    collection(db, "groups"),
    where("members", "array-contains", user.uid)
  );

  return onSnapshot(groupsQuery, (snapshot) => {
    const groups = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));

    // Client-side sort
    groups.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    callback(groups);
  });
}

export async function leaveGroup(groupId) {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const membersQuery = query(
      collection(db, `groups/${groupId}/members`),
      where("uid", "==", user.uid)
    );

    const memberSnapshot = await getDocs(membersQuery);

    if (!memberSnapshot.empty) {
      const memberDoc = memberSnapshot.docs[0];
      await deleteDoc(doc(db, `groups/${groupId}/members`, memberDoc.id));
    }

    const groupRef = doc(db, "groups", groupId);


    const groupDoc = await getDoc(groupRef);
    const currentMembers = groupDoc.data().members || [];
    const updatedMembers = currentMembers.filter(uid => uid !== user.uid);

    await updateDoc(groupRef, {
      members: updatedMembers,
      membersCount: increment(-1)
    });

    return true;
  } catch (error) {
    console.error("Error leaving group:", error);
    return false;
  }
}