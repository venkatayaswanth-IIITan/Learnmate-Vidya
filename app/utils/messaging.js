"use client";

import {
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
  serverTimestamp,
  limit,
  where
} from "firebase/firestore";
import { auth, db } from "../firebase";

export async function sendMessage(groupId, text) {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    await addDoc(collection(db, `groups/${groupId}/messages`), {
      text,
      uid: user.uid,
      displayName: user.displayName || user.email || `User-${user.uid.substring(0, 5)}`,
      photoURL: user.photoURL || null,
      email: user.email,
      createdAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
}

export function listenToMessages(groupId, callback, messagesLimit = 50) {
  if (!groupId) {
    callback([]);
    return () => {};
  }

  const messagesQuery = query(
    collection(db, `groups/${groupId}/messages`),
    orderBy("createdAt", "asc"),
    limit(messagesLimit)
  );

  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));

    callback(messages);
  });
}

export function getGroupMembers(groupId, callback) {
  if (!groupId) {
    callback([]);
    return () => {};
  }

  const membersQuery = query(
    collection(db, `groups/${groupId}/members`),
    orderBy("joinedAt")
  );

  return onSnapshot(membersQuery, (snapshot) => {
    const members = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      joinedAt: doc.data().joinedAt?.toDate(),
      displayName: doc.data().displayName || doc.data().email || 'Anonymous'
    }));

    callback(members);
  });
}