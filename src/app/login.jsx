import React, { useState } from "react";
import Footer from "../components/footer";
import { signInWithProvider } from "../firebase/auth/signIn";
import { Icon } from "@iconify/react";

export default function Login() {
    const [isLoading, setIsLoading] = useState({
        google: false,
        github: false
    });
    const [error, setError] = useState(null);

    const handleLogin = async (provider) => {
        setIsLoading(prev => ({ ...prev, [provider]: true }));
        setError(null);

        try {
            const { result, error } = await signInWithProvider(provider);

            if (error) {
                setError(error);
            }
        } catch (error) {
            setError('erro');
            console.error(error);
        } finally {
            setIsLoading(prev => ({ ...prev, [provider]: false }));
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
                {error && (
                    <div className="w-full max-w-md p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex flex-col gap-4 w-full max-w-md">
                    <button
                        onClick={() => handleLogin('github')}
                        disabled={isLoading.github}
                        className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Icon icon='mdi:github'></Icon>
                        {isLoading.github ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            'Entrar com GitHub'
                        )}
                    </button>

                    <button
                        onClick={() => handleLogin('google')}
                        disabled={isLoading.google}
                        className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Icon icon='ri:google-fill'></Icon>
                        {isLoading.google ? (
                            <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            'Entrar com Google'
                        )}
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    );
}