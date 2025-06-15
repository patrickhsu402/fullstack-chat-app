import {create} from 'zustand';
import {axiosInstance} from '../lib/axios.js';
import toast from 'react-hot-toast';
import {io} from 'socket.io-client';

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isSigningUp: false, 
    isCheckingAuth: true,
    onlineUsers: [],
    socket:null,
    checkAuth:async()=>{
        try{
            const res = await axiosInstance.get("/auth/check");//in axios, the baseURL is already set to "http://localhost:5001/api"
            set({authUser:res.data});//set is pram of this
            get().connectSocket();
        }catch(error){
            console.error("Error checking authentication:", error);
            set({authUser:null});
        }finally{
            set({isCheckingAuth:false});
        }
    },

    
    signup: async(data)=>{
        set({isSigningUp:true});
        try{
            const res = await axiosInstance.post("/auth/signup", data);
            set({authUser:res.data});
            toast.success("Account created successfully!");
            get().connectSocket();

        }catch(error){
            toast.error(error.response.data.message);
        }finally{
            set({isSigningUp:false});
        }

    },

    login: async(data)=>{
        set({isLoggingIn:true});
        try{
            const res = await axiosInstance.post("/auth/login", data);
            set({authUser:res.data});
            toast.success("Logged in successfully!");
            get().connectSocket();
        }catch(error){
            console.error("Error logging in:", error);
            toast.error(error.response.data.message);
        }finally{
            set({isLoggingIn:false});
        }
    },

    logout:async()=>{
        try{
            await axiosInstance.post("/auth/logout");
            set({authUser:null});
            toast.success("Logged out successfully!");
            get().disconnectSocket();
        }catch(error){
            console.error("Error logging out:", error);
            toast.error("Failed to log out. Please try again.");
        }
    },

    updateProfile: async(data) => {
        set({isUpdatingProfile:true});
        try{
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({authUser:res.data});
            toast.success("Profile updated successfully!");
        }catch(error){
            console.error("Error updating profile:", error);
            toast.error(error.response.data.message);
        }finally{
            set({isUpdatingProfile:false});
        }
    },

    connectSocket:()=>{
        const {authUser} = get();
        if(!authUser || get().socket?.connnected) {
            return;
        }
        //on connect to socket when the user is logged in
        const socket = io(BASE_URL,{
            query:{userId:authUser._id}
        });
        // userId that we defind in socket.js
        socket.connect();
        set({socket:socket});//set status

        socket.on("getOnlineUsers", (userIds) => {
            set({onlineUsers:userIds});
        });
    },

    disconnectSocket:()=>{

        if(get().socket?.connected){
            get().socket.disconnect();
        }

    }

    

}));