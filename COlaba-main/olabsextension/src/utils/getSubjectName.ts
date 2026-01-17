import { db } from "../firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

async function getSubjectName(subjectId: string) {
  const subjectRef = collection(db, "subjects");
  const q = query(subjectRef, where("id", "==", parseInt(subjectId)));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data().name;
  } else {
    return "Unknown Subject";
  }
}

export default getSubjectName;
