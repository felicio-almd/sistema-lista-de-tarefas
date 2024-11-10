import { getAuth, GithubAuthProvider, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import app from "../firebase";

const auth = getAuth(app);
const providers = {
    google: new GoogleAuthProvider(),
    github: new GithubAuthProvider()
  };
  
  export async function signInWithProvider(providerName) {
    const provider = providers[providerName];
    if (!provider) throw new Error(`Erro de provedor ${providerName}`);
  
    try {
      const result = await signInWithPopup(auth, provider);
      return { result, error: null };
    } catch (error) {
      console.error(`${providerName} Erro de login`, error);
      return { 
        result: null, 
        error: error.message || `Erro ao fazer login com ${providerName}` 
      };
    }
  }