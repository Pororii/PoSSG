import { User } from "../interfaces/Interfaces";

export const getUserFromLocalStorage = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };
  
  export const saveUserToLocalStorage = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
  };
  
  export const removeUserFromLocalStorage = () => {
    localStorage.removeItem('user');
  };
  