'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from 'lucide-react'
import useStore from "@/app/store"
import socket from '@/app/socket'
import { usePathname, useRouter } from 'next/navigation'

const NameForm = ({setShowNameForm}) => {
    const name = useStore((state) => state.name);
    const [error, setError] = useState("")
    const setName = useStore((state) => state.setName);
    const setRoomPlayers = useStore((state) => state.setRoomPlayers);
    const setIsHost = useStore((state) => state.setIsHost);
    const setSettings = useStore((state) => state.setSettings);


    const pathname = usePathname();  
    const router = useRouter();

    useEffect(() => {
        socket.on("room_error", (data) => {
            alert(data.message);
            router.push("/");
        });
    }, [socket]);

    const handleJoinRoom = async () => {
        if (!name) {
            setError("Name is required.");
            return;
        }

        setName(name);

        const segments = pathname.split('/');
        const id = segments[segments.length - 1]; // Get the last segment of the path
        
        socket.emit("join_room", {
            playerName: name,
            roomId: id
        });

        socket.on("joined_room", (data) => {
            setRoomPlayers(data.players);
            setIsHost(data.isHost);
            setSettings(data.settings);
        });

        setShowNameForm(false);
        
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
        >
            <motion.div
                className='w-full max-w-md'
            >
                <Card className="w-full bg-white">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">Create Room</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Your Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className="bg-white border-gray-300"
                            />
                            {error && (
                                <p className="flex items-center text-sm text-red-600" role="alert">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {error}
                                </p>
                            )}
                        </div>

                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleJoinRoom} className="w-full bg-black hover:bg-gray-800 text-white">
                            Join Room
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </motion.div>
    )
}

export default NameForm