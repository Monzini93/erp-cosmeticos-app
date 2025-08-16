import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgnX3mou6T-BR7wN3JriV8FFaK0ZNO-Lk",
  authDomain: "erp-cosmeticos-mvp.firebaseapp.com",
  projectId: "erp-cosmeticos-mvp",
  storageBucket: "erp-cosmeticos-mvp.appspot.com", // Corrigi o final para .appspot.com que é o padrão
  messagingSenderId: "736616281475",
  appId: "1:736616281475:web:5ed8cb3c7c4d112b2c32b6",
  measurementId: "G-40QY5K6M47"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços que vamos usar no resto do app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = firebaseConfig.appId;