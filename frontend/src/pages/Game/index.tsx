/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useRef, useState } from "react";
import { GameContext } from "../../providers/GameContext"

let instantiated = false;
let lastTime = Date.now()
let currentTime = Date.now();

let isCollidingX = false, isCollidingY = false;

type BallData = { x: number, y: number, speed: number, angle: number };

export default function Game() {
    const {username,  match, websocket} = useContext(GameContext);
    const canvasRef = useRef<HTMLCanvasElement | null>(null); 
    const [userPosition, setUserPosition] = useState(0);
    const [enemyPosition, setEnemyPosition] = useState(0);
    const [ball, setBall] = useState<BallData | null>(null);

    const height = 600, width = 800;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const handleCollision = () => {
        if (!ball)
            return;

        const ballRadius = 10;
        
        if (ball.y + ballRadius >= height) {
            if (!isCollidingY) { // Only handle collision once
                ball.y = height - ballRadius; // Reset position to just inside the bottom wall
                ball.angle = 360 - ball.angle; // Invert Y direction
                isCollidingY = true;
            }
        } else if (ball.y - ballRadius <= 0) {
            if (!isCollidingY) {
                ball.y = ballRadius; // Reset position to just inside the top wall
                ball.angle = 360 - ball.angle; // Invert Y direction
                isCollidingY = true;
            }
        } else {
            isCollidingY = false;
        }
    
        // Check if the ball is colliding with left or right walls (X-axis inversion)
        if (ball.x + ballRadius >= width) {
            if (!isCollidingX) { // Only handle collision once
                ball.x = width - ballRadius; // Reset position to just inside the right wall
                ball.angle = 360 - ball.angle; // Invert X direction
                isCollidingX = true;
            }
        } else if (ball.x - ballRadius <= 0) {
            if (!isCollidingX) {
                ball.x = ballRadius; // Reset position to just inside the left wall
                ball.angle = 360 - ball.angle; // Invert X direction
                isCollidingX = true;
            }
        } else if (isCollidingX) {
                isCollidingX = false;
        }
    }

    const moveBall = (deltaTime: number) => {
        if (!ball)
            return;

        const angleRad = ball.angle / (Math.PI * 180);

        ball.x += Math.cos(angleRad) * ball.speed * (deltaTime / 1000);
        ball.y += Math.sin(angleRad) * ball.speed * (deltaTime / 1000);
    }

    useEffect(() => {
        lastTime = Date.now();

        const interval = setInterval(() => {
            currentTime = Date.now();
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;
            moveBall(deltaTime);
            handleCollision();

            setBall(ball);
        }, 10);

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
                    width={width}
                    height={height}
                    style={{border: "2px solid black"}}
                    onMouseMove={handleMouseMove}
                ></canvas>

            </div>
        </>
    )
}