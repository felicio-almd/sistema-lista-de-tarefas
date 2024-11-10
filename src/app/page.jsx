'use client'
import { ThemeProvider } from "next-themes";
import Login from "./login";
import { useEffect, useState } from "react";
import {
  getAuth,
  GithubAuthProvider,
  getRedirectResult
} from "firebase/auth";
import Dashboard from "./dashboard";
import { app } from "../firebase/firebase.js";
import { TasksProvider } from "../hooks/useTasks";

export default function Home() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setError(null);
      } else {
        setUser(null);
      }
    });

    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          const credential = GithubAuthProvider.credentialFromResult(result);
          const token = credential.accessToken;
          const user = result.user;
          setUser(user);
          setError(null);
        }
      })
      .catch((error) => {
        setError(error.message);
        console.error("Redirect Error:", error);
      });

    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {user ? (
        <TasksProvider>
          <Dashboard />
        </TasksProvider >
      ) : (
        <Login />
      )}
    </ThemeProvider>
  );
}