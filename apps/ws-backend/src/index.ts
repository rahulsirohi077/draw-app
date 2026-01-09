import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({port:8080});

interface User {
    userId:string;
    rooms: string[];
    ws: WebSocket
}

const users:User[] = [];

function checkUser(token:string): string|null{
    try {
        const decoded = jwt.verify(token,JWT_SECRET);
    
        if(typeof decoded === 'string' || !decoded || !decoded.userId){
            return null;
        }
        return decoded.userId;
    } catch (error) {
        return null
    }
}

wss.on("connection",(ws,request)=>{
    const url = request.url;
    if(!url){
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') ?? "";
    const userId = checkUser(token);

    if(!userId){
        ws.close();
        return;
    }

    users.push({
        userId,
        rooms:[],
        ws
    })

    ws.on('message',async (data)=>{
        const parsedData = JSON.parse(data as unknown as string);

        if(parsedData.type === "join_room"){
            const user = users.find(x=>x.ws===ws);
            user?.rooms.push(parsedData.roomId);
        }

        if(parsedData.type === "leave_room"){
            const user = users.find(x=>x.ws===ws);
            if(!user) return;
            user.rooms = user.rooms.filter(x=>x!==parsedData.roomId);
        }

        if(parsedData.type === "chat"){
            const roomId = parsedData.roomId;
            const message = parsedData.message;
            
            await prismaClient.chat.create({
                data: {
                    roomId,
                    message,
                    userId
                }
            });
            
            users.forEach(user => {
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type:"chat",
                        message,
                        roomId
                    }));
                }
            })
        }
    })

})