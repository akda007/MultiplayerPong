/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useState } from "react";
import { GameContext } from "../../providers/GameContext"
import { Button } from "@mui/material";

let instantiated = false;

export default function Game() {
    const {username, target, match, websocket} = useContext(GameContext);

    const socketController = (data: any) => {
        console.log(data)
        switch (data.type) {
            case "update":
                console.log(data);
                break;
        }
    }

    if (!instantiated) {
        websocket?.addEventListener("message", (msg) => {
            const data = JSON.parse(msg.data);

            socketController(data);
        });
    }
    
    instantiated = true;
    
    

    return (
        <>
            <div style={{height: "100vh", width: "100vw"}} onMouseMove={async (event) => {
                websocket?.send(JSON.stringify({
                    type: "update",
                    data: {
                        name: username,
                        match: match,
                        position: event.clientX,
                    }
                }))
            }}>

            </div>
        </>
    )
}