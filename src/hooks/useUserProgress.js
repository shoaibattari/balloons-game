import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export default function useUserProgress() {
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          email: user.email || null,
          currentLevel: 1,
          createdAt: new Date(),
        });
        setLevel(1);
      } else {
        setLevel(snap.data().currentLevel || 1);
      }
      setLoading(false);
    };

    fetchProgress();
  }, []);

  return { level, loading };
}
