/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useRef, useState } from "react";
import { GameContext } from "../../providers/GameContext"
import { Button } from "@mui/material";

let instantiated = false;

type BallData = { x: number, y: number, speed: number, angle: number };

export default function Game() {
    const {username, target, match, websocket} = useContext(GameContext);
    const canvasRef = useRef<HTMLCanvasElement | null>(null); 
    const [userPosition, setUserPosition] = useState(0);
    const [enemyPosition, setEnemyPosition] = useState(0);
    const [ball, setBall] = useState<BallData | null>(null);

    const drawPaddles = (userPos: number, enemyPos: number) => {
        const canvas = canvasRef.current;

        if (!canvas)
            return;

        const context = canvas.getContext("2d");

        if (!context)
            return;

        context.clearRect(0, 0, canvas.width, canvas.height);

        const paddleWidth = 10, paddleHeigth = 100;
        
        const userPaddleX = 10;
        const userPaddleY = userPos - paddleHeigth / 2;

        const enemyPaddleX = canvas.width - 20;
        const enemyPaddleY = enemyPos - paddleHeigth/ 2;

        context.fillStyle = '#000000';
        context.fillRect(userPaddleX, userPaddleY, paddleWidth, paddleHeigth);
        context.fillRect(enemyPaddleX, enemyPaddleY, paddleWidth, paddleHeigth);

    }

    const socketController = (data: any) => {
        switch (data.type) {
            case "update":
                console.log(data);
                setEnemyPosition(data.position)
                break;
        }
    }

    useEffect(() => {
        if (!instantiated) {
            websocket?.addEventListener("message", (msg) => {
                const data = JSON.parse(msg.data);
    
                socketController(data);
            });            
            instantiated = true;
        }

        drawPaddles(userPosition, enemyPosition);
    }, [userPosition, enemyPosition, websocket])

   
    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        const canvas = canvasRef.current;

        if (!canvas)
            return;

        const rect = canvas.getBoundingClientRect();
        const mouseY = event.clientY - rect.top;

        setUserPosition(mouseY);

        websocket?.send(JSON.stringify({
            type: "update",
            data: {
                name: username,
                match: match,
                position: mouseY,
            }
        }))
    }
    

    return (
        <>
            <div style={{height: "100vh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center"}} >
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    style={{border: "2px solid black"}}
                    onMouseMove={handleMouseMove}
                ></canvas>

            </div>
        </>
    )
}