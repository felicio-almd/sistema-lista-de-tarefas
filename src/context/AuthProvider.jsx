'use client'

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, getAuth, signOut } from 'firebase/auth';
import { AuthContext } from './AuthContext';
import app from '../firebase/firebase';

const auth = getAuth(app);

export const AuthContextProvider = ({
    children,
}) => {
    const [userAuth, setUserAuth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (authUserCredentials) => {
            setUserAuth(authUserCredentials);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    async function logout() {
        let result = null,
            error = null;
        try {
            result = await signOut(auth);
        } catch (e) {
            error = e;
        }

        return { result, error };
    }

    return (
        <AuthContext.Provider value={{ userAuth, logout }}>
            {loading
                ?
                <div className="flex items-center gap-8 justify-center min-h-screen bg-gray-100">
                    <div className="text-4xl spinner mr-4"></div>
                    <h1 className="text-4xl font-bold text-gray-700">Caregando...</h1>
                </div>
                :
                children
            }
        </AuthContext.Provider>
    );
};