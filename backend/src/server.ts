import WebSocket, { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid"
import app from "./app";


interface Client {
    id: string;
    ws: WebSocket;
}

interface Match {
    id: string
    clientA: Client | undefined;
    clientB: Client | undefined;
}

interface UserEvent {
    type: string,
    data: any
}

const clients: Record<string, Client> = {};
const matches: Record<string, Match> = {};

(async () => {
    const port = 8080;

    
    const server = app.listen(port, () => {
        console.log("Server started");
    })

    const wss = new WebSocketServer({server})


    wss.on("listening", () => {
        console.log("Websocket started!");

        wss.on("connection", async (ws) => {
            ws.send(JSON.stringify({ message: "Connected!"}))

            ws.on("message", async (message: string) => {
                const data: UserEvent = JSON.parse(message);

                if (data.type === "notify") {
                    const info = data.data;

                    const name = info.name;
                    const target = info.target;

                    clients[name] = { id: name, ws }

                    let match: Match | undefined = undefined;

                    

                    Object.values(matches).every(x => {
                        if (x.clientA?.id === name) {
                            match = x;
                            return false;
                        }

                        if (!x.clientA) {
                            return false;
                        }

                        if (x.clientA.id === target) {
                            match = x;
                            match.clientB = clients[name]
                        }

                        return true;
                    })


                    if (match == undefined) {
                        const matchId = uuidv4();

                        matches[matchId] = {
                            clientA: clients[name],
                            clientB: undefined,
                            id: matchId
                        }

                        match = matches[matchId];
                    }

                    ws.send(JSON.stringify({
                        matchId: match.id,
                        type: "connection"
                    }))
                }

                if (data.type === 'update') {
                    const info = data.data;

                    console.log(info)

                    const {name, match, position}:{name:string, match: string, position:number} = info;

                    const currentMatch = matches[match];
                    


                    if (currentMatch.clientA?.id === name) {
                        await currentMatch.clientB?.ws.send(JSON.stringify({
                            position, type: "update"
                        }))
                    } else if (currentMatch.clientB?.id === name) {
                        await currentMatch.clientA?.ws.send(JSON.stringify({
                            position, type: "update"
                        }))
                    }
                }

            })
        });
    })
})();