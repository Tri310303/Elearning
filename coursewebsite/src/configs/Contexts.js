import { createContext } from "react";

export const MyUserContext = createContext();
export const MyDispatchContext = createContext();
export const MySearchContext = createContext();
export const MyBookContext = createContext([{}, () => {}]);