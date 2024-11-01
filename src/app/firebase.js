// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getDatabase} from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOwuwUi4dp-p9Ya4awLeemiXM5Lk4606c",
  authDomain: "sistema-lista-tarefas.firebaseapp.com",
  projectId: "sistema-lista-tarefas",
  storageBucket: "sistema-lista-tarefas.firebasestorage.app",
  messagingSenderId: "442649067635",
  appId: "1:442649067635:web:10d52eaf639a2a7d66aa06"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
 