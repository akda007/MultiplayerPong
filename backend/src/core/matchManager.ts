import { v4 as uuidv4 } from "uuid"
import { Client } from "./clientManager";
import { Ball } from "./ball";

interface Match {
    id: string
    clientA: Client | undefined;
    clientB: Client | undefined;
    ball: Ball;
}

export class MatchManager {
    private matches: Record<string, Match> = {};

    createMatch(clientA: Client): Match {
        const matchId = uuidv4();
        const ball = new Ball(400, 300, 100, 45);
        const newMatch: Match = { id: matchId, clientA, clientB: undefined, ball};
        this.matches[matchId] = newMatch;
        return newMatch;
    }

    getMatch(matchId: string): Match | undefined {
        return this.matches[matchId]
    }

    updateBallPosition(matchId: string, deltaTime: number, heigth: number) {
        const match = this.getMatch(matchId);
        if (!match) return;

        match.ball.updatePosition(deltaTime);
        match.ball.checkWallColission(heigth);
    }

    getBallData(matchId: string) {
        const match = this.getMatch(matchId);
        return match ? { x: match.ball.x, y: match.ball.y, speed: match.ball.speed, angle: match.ball.angle } : null;
    }

    findOrCreateMatch(client: Client, target: string): Match {
        let match: Match | undefined = Object.values(this.matches).find(
            (match) => match.clientA?.id === target && !match.clientB
        )

        if (!match) {
            match = this.createMatch(client);
        } else {
            match.clientB = client;
        }

        return match;
    }
}