import { useEffect, useState } from "react";
import { WS_URL } from "../app/config";

export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjNWEyZGQwMC0wMzI0LTRlZTktYjZiNS0yZDE2ZDNjNWM4ZTEiLCJpYXQiOjE3Njc5NjY5NDV9.xnn-jc7NREyEgRHfUGku6qUDIFwBHH6E8KBrC0qHJ_I`);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
    }, [])

    return {
        socket,
        loading
    }
}