import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import {
    Account,
    ID,
} from "react-native-appwrite";

import { client } from "../lib/appwrite";

type User = {
    id: string;
    name: string;
    email: string;
};

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (
        email: string,
        password: string
    ) => Promise<boolean>;
    signup: (
        name: string,
        email: string,
        password: string
    ) => Promise<boolean>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<
    AuthContextType | undefined
>(undefined);

const account = new Account(client);

export function AuthProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore Appwrite session when the app starts
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const currentUser = await account.get();

                setUser({
                    id: currentUser.$id,
                    name: currentUser.name || "Aora User",
                    email: currentUser.email,
                });
            } catch {
                // No active Appwrite session
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

    // Login with Appwrite
    const login = async (
        email: string,
        password: string
    ): Promise<boolean> => {
        if (!email.trim() || !password.trim()) {
            return false;
        }

        try {
            await account.createEmailPasswordSession({
                email: email.trim(),
                password,
            });

            const currentUser = await account.get();

            setUser({
                id: currentUser.$id,
                name: currentUser.name || "Aora User",
                email: currentUser.email,
            });

            return true;
        } catch (error) {
            console.error("Appwrite login failed:", error);

            return false;
        }
    };

    // Create a new Appwrite account
    const signup = async (
        name: string,
        email: string,
        password: string
    ): Promise<boolean> => {
        if (
            !name.trim() ||
            !email.trim() ||
            !password.trim()
        ) {
            return false;
        }

        try {
            await account.create({
                userId: ID.unique(),
                email: email.trim(),
                password,
                name: name.trim(),
            });

            // Create session immediately after signup
            await account.createEmailPasswordSession({
                email: email.trim(),
                password,
            });

            const currentUser = await account.get();

            setUser({
                id: currentUser.$id,
                name: currentUser.name || name.trim(),
                email: currentUser.email,
            });
            return true;
        } catch (error) {
            console.error("Appwrite signup failed:", error);

            return false;
        }
    };

    // Logout from Appwrite
    const logout = async (): Promise<void> => {
        try {
            await account.deleteSession({
                sessionId: "current",
            });
        } catch (error) {
            console.error("Appwrite logout failed:", error);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: user !== null,
                isLoading,
                login,
                signup,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}
