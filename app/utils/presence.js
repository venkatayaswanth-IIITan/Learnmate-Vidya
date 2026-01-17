'use client';

import { ref, onValue, set, onDisconnect } from 'firebase/database';
import { rtdb, auth } from '../firebase';

export function setupPresence() {
  const user = auth.currentUser;
  const uid = user?.uid;
  if (!uid) return null;
  
  const userStatusRef = ref(rtdb, `status/${uid}`);
  const connectedRef = ref(rtdb, '.info/connected');
  
  const displayName = user.displayName || user.email || `User-${uid.substring(0, 5)}`;
  
  const onlineHandler = onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === true) {
      const userStatus = {
        online: true,
        lastSeen: new Date().toISOString(),
        displayName: displayName,
        photoURL: user.photoURL || null,
        email: user.email || null,
        uid: uid
      };
      
      onDisconnect(userStatusRef).set({
        online: false,
        lastSeen: new Date().toISOString(),
        displayName: displayName,
        photoURL: user.photoURL || null,
        email: user.email || null,
        uid: uid
      });
      
      set(userStatusRef, userStatus);
    }
  });
  
  return () => {
    onlineHandler();
  };
}

export function getOnlineUsers(callback) {
  const statusRef = ref(rtdb, 'status');
  
  const statusHandler = onValue(statusRef, (snapshot) => {
    const statuses = snapshot.val() || {};
    const onlineUsers = Object.entries(statuses)
      .filter(([_, status]) => status.online)
      .map(([uid, status]) => ({
        uid,
        displayName: status.displayName || status.email || `User-${uid.substring(0, 5)}`,
        photoURL: status.photoURL,
        email: status.email,
        lastSeen: status.lastSeen
      }));
      
    callback(onlineUsers);
  });
  
  return statusHandler;
}