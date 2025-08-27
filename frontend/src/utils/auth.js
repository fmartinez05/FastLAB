import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth, db } from "../firebase-config";
import { doc, setDoc, getDoc } from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Guardar o verificar el usuario en Firestore
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date()
      });
    }
    return user;
  } catch (error) {
    console.error("Error durante el inicio de sesión con Google:", error);
    return null;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};

export const onAuthenticationChanged = (callback) => {
  return onAuthStateChanged(auth, callback);
};