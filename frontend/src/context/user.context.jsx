import { createContext, useContext, useState } from 'react';

export const UserContext = createContext();

// Create a custom hook to use the UserContext
export const useUser = () => {
    return useContext(UserContext);
};

// Create the provider component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Set a user (e.g., after successful login)
    const setUserData = (userData) => {
        setUser(userData);
    };

    // Log out user (clear user data)
    const logout = () => {
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, setUserData, logout }}>
            {children}
        </UserContext.Provider>
    );
};
