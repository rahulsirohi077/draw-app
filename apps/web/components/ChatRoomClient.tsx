"use client";
import React, { useEffect, useState } from 'react'
import { useSocket } from '../hooks/useSocket';

const ChatRoomClient = ({
    messages,
    id
}: {
    messages: { message: string }[],
    id: string
}) => {
    const [chats, setChats] = useState(messages);
    const [currentMessage,setCurrentMessage] = useState<string>("");
    const { socket, loading } = useSocket();

    useEffect(() => {
        if (socket && !loading) {
            socket.send(JSON.stringify({
                type: "join_room",
                roomId: id
            }));

            socket.onmessage = (event) => {
                const parsedData = JSON.parse(event.data);
                if (parsedData.type === "chat") {
                    setChats(c => [...c, {message: parsedData.message}]);
                }
            }
        }

        return () => {
            socket?.close();
        }
    }, [socket, loading, id])
    return (
        <div>
            {chats.map((m,indx) => (
                <div key={indx}>
                    {m.message}
                </div>
            ))}

            <input onChange={(e)=>{
                setCurrentMessage(e.target.value);
            }}></input>

            <button onClick={()=>{
                socket?.send(JSON.stringify({
                    type:"chat",
                    roomId:id,
                    message: currentMessage
                }))
                setCurrentMessage("");
            }}>Send Message</button>
        </div>
    )
}

export default ChatRoomClient