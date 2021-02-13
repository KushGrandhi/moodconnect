import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'
import { Chatbot } from 'react-chatbot-kit'
import MessageParser from './MessageParser'
import ActionProvider from './ActionProvider'
import config from './config'
import io from "socket.io-client";


function ChatbotComponent(props) {
    const [mood, setMood] = useState(null);
    const [showBot, toggleBot] = useState(true);
    let socket = null;
    const history = useHistory();


    useEffect(() => {
        console.log("CAME HEre")
        window.$user = "akash"; // can be replaced with some kind of unique id
        const url = "http://localhost:8000";
        socket = io(url);
        socket.emit("online", window.$user)
        socket.on("connect", (msg) => {
            console.log("CLIENT CONNECTED");
        })
        socket.on("message", (msg) => {
            console.log("MSG IS : ", msg);
        });
        socket.on("set mood", (mood) => {
            console.log("You are : ", mood);
            setMood(mood); // mood here is the mood recieved from the server
            window.$mood = mood;
            toggleBot(false);
            history.push("/call")
        });
        return () => {
            socket.disconnect();
        }


    }, [])

    return (
        <div>
            <header className="App-header">
                {showBot &&
                    <Chatbot
                        config={config}
                        actionProvider={ActionProvider}
                        messageParser={MessageParser}
                    />
                }
            </header>
        </div>
    )
}

export default ChatbotComponent;