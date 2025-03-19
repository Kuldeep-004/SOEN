import socket from 'socket.io-client';

let socketinstance=null;

export const initializeSocket=(projectId)=>{
    socketinstance=socket(import.meta.env.VITE_API_URL,{
        auth:{
            token:localStorage.getItem('token')
        },
        query:{
            projectId
        }
    });

    return socketinstance; 
}

export const receiveMessage=(eventName,cb)=>{
    socketinstance.on(eventName,cb);
}

export const sendMessage=(eventName,data)=>{
    socketinstance.emit(eventName,data);
}