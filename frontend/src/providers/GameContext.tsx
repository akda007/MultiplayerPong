import { createContext, ReactNode, useState } from "react";

interface IGameContext {
    username: string,
    setUsername: (value: string) => void,
    target: string,
    setTarget: (value: string) => void,
    match: string
    setMatch: (value: string) => void
}

export const GameContext = createContext({} as IGameContext);


export function GameProvider({children}: {children: ReactNode}) {
    const [username, setUsername] = useState("");
    const [target, setTarget] = useState("");
    const [match, setMatch] = useState("");

    const handleSetUsername = (value: string) => {
        setUsername(value);
    }
    const handleSetTarget = (value: string) => {
        setTarget(value);
    }
    const handleSetMatch = (value: string) => {
        setMatch(value);
    }
    
    return (
        <GameContext.Provider value={{username, target, match, setUsername: handleSetUsername, setTarget: handleSetTarget, setMatch: handleSetMatch}}>
            {children}
        </GameContext.Provider>
    );
}