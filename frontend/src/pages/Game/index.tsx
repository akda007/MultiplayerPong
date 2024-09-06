/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useEffect, useRef, useState } from "react";
import { GameContext } from "../../providers/GameContext"

let instantiated = false;
let lastTime = Date.now()
let currentTime = Date.now();

type BallData = { x: number, y: number, vx: number, vy: number };

export default function Game() {
    const {username,  match, websocket} = useContext(GameContext);
    const canvasRef = useRef<HTMLCanvasElement | null>(null); 
    const [userPosition, setUserPosition] = useState(0);
    const [enemyPosition, setEnemyPosition] = useState(0);
    const [ball, setBall] = useState<BallData | null>(null);

    const height = 600, width = 800;
    const radius = 10;

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
        context.arc(ball.x, ball.y, radius, 0, Math.PI * 2);
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
                setEnemyPosition(data.position)
                break;
            
            case "ball":
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
                ball: ball
            }
        }))
    }

    const handleCollisionX = () => {
        if (!ball)
            return;

        if (ball.x + radius >= width || ball.x - radius <= 0) {
            ball.vx = -ball.vx;
        }

    }

    const handleCollisionY = () => {
        if (!ball)
            return;

        if (ball.y + radius >= height || ball.y - radius <= 0) {
            ball.vy = -ball.vy;
            return true;
        }

        return false;
    }

    const handlePaddleCollision = () => {
        if (!ball)
            return;


        const paddleWidth = 10, paddleHeight = 100;

        const userPaddleX = 10;
        const userPaddleY = userPosition - paddleHeight / 2;

        const enemyPaddleX = width - 20;
        const enemyPaddleY = enemyPosition - paddleHeight / 2;

        let collided = false;

        if (ball.x - radius <= userPaddleX + paddleWidth && ball.x + radius >= userPaddleX) {
            if (ball.y >= userPaddleY && ball.y <= userPaddleY + paddleHeight) {
                ball.vx = -ball.vx; 
    
                const hitPos = (ball.y - userPaddleY) / paddleHeight - 0.5;
                ball.vy += hitPos * Math.abs(ball.vx);
                collided = true;
            }
        }
    
        if (ball.x + radius >= enemyPaddleX && ball.x - radius <= enemyPaddleX + paddleWidth) {
            if (ball.y >= enemyPaddleY && ball.y <= enemyPaddleY + paddleHeight) {
                ball.vx = -ball.vx;
    
                const hitPos = (ball.y - enemyPaddleY) / paddleHeight - 0.5;
                ball.vy += hitPos * Math.abs(ball.vx);
                collided = true
            }
        }

        return collided;
    }


    const moveBall = (deltaTime: number) => {
        if (!ball)
            return;

        ball.x += ball.vx * (deltaTime / 1000);
        ball.y += ball.vy * (deltaTime / 1000);
    }

    useEffect(() => {
        const interval = setInterval(() => {
            currentTime = Date.now();
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            moveBall(deltaTime);
            handleCollisionX();

            if (handlePaddleCollision() || handleCollisionY()) {
                // sendBallState();
            };

            setBall(ball);
        });

        return () => clearInterval(interval);
    }, [ball, userPosition, enemyPosition, websocket])
   
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