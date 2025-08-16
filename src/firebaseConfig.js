import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgnX3mou6T-BR7wN3JriV8FFaK0ZNO-Lk",
  authDomain: "erp-cosmeticos-mvp.firebaseapp.com",
  projectId: "erp-cosmeticos-mvp",
  storageBucket: "erp-cosmeticos-mvp.appspot.com",
  messagingSenderId: "736616281475",
  appId: "1:736616281475:web:5ed8cb3c7c4d112b2c32b6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);