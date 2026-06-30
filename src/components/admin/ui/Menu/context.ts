import { createContext } from 'react';

/** Lets a MenuItem close its parent Menu after it runs its action. */
export const MenuContext = createContext<() => void>(() => {});
