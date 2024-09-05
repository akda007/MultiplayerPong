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

    const drawPaddles = (context: CanvasRenderingContext2D) => {
        const paddleWidth = 10, paddleHeight = 100;
        const userPaddleX = 10;
        const userPaddleY = userPosition - paddleHeight / 2;
        const enemyPaddleX = context.canvas.width - 20;
        const enemyPaddleY = enemyPosition - paddleHeight / 2;

        context.fillStyle = '#000000';
        context.fillRect(userPaddleX, userPaddleY, paddleWidth, paddleHeight);
        context.fillRect(enemyPaddleX, enemyPaddleY, paddleWidth, paddleHeight);
    }

   const drawBall = (context: CanvasRenderingContext2D) => {
        if (!ball) return;

        context.beginPath();
        context.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
        context.fillStyle = "#000000";
        context.fill();
        context.closePath();
   }

   const render = () => {
    const canvas = canvasRef.current;

    if (!canvas)
        return;

    const context = canvas.getContext("2d");

    if (!context)
        return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    drawPaddles(context);
    drawBall(context);

    requestAnimationFrame(render);
   }

    const socketController = (data: any) => {
        switch (data.type) {
            case "update":
                console.log(data);
                setEnemyPosition(data.position)
                break;
            
            case "ball":
                console.log(data)
                setBall(data.data);
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

        if (instantiated && !ball) {
            websocket?.send(JSON.stringify({
                type: "get-ball",
                data: {
                    matchId: match
                }
            }))
        }

        render();
    }, [userPosition, enemyPosition, websocket, ball])

    const sendBallState = () => {
        if (!ball)
            return;

        websocket?.send(JSON.stringify({
            type: "ball",
            data: {
                matchId: match,
                deltaTime: 1,
                heigth: 600
            }
        }))
    }

    useEffect(() => {
        const interval = setInterval(() => {
            sendBallState();
        }, 100);

        return () => clearInterval(interval);
    }, [ball, websocket])
   
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