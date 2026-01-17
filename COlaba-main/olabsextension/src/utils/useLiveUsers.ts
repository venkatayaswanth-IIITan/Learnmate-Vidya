import { db } from "../firebase/firebase";
import { doc, setDoc, deleteDoc,collection,onSnapshot,query,where} from "firebase/firestore";
import { useState, useEffect } from "react";
interface Experiment {
  sub: string;
  sim: string;
}

export async function setUserLiveStatus(
  experiment: Experiment,
  userId: string,
  userName: string,
  userEmail: string, 
  isLive: boolean
) {
  if (!experiment || !userId) return;

  const experimentCollection = `${experiment.sub}_${experiment.sim}`;
  const userDocRef = doc(db, "live", experimentCollection, "users", userId);

  if (isLive) {
    await setDoc(userDocRef, { name: userName, email: userEmail, live: true }, { merge: true });
  } else {
    await deleteDoc(userDocRef);
  }
}

interface User {
  id: string;
  name: string;
  email: string; 
  live: boolean;
}


export default function useLiveUsers(experiment: Experiment | null) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!experiment) return;

    const experimentCollection = `${experiment.sub}_${experiment.sim}`;
    const liveUsersCollectionRef = collection(db, "live", experimentCollection, "users");

    const liveUsersQuery = query(liveUsersCollectionRef, where("live", "==", true));

    const unsubscribe = onSnapshot(liveUsersQuery, (snapshot) => {
      const liveUsersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<User, "id">), 
      }));
      setUsers(liveUsersList);
    });

    return () => unsubscribe();
  }, [experiment]);

  return users;
}
