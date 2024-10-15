import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from 'lucide-react'
import useStore from "@/app/store"
import { useRouter } from 'next/navigation'

import socket from '@/app/socket'

import { customAlphabet } from 'nanoid'

export function CreateRoomCard({ showCreateRoom, setShowCreateRoom }) {
    const name = useStore((state) => state.name);
    const setName = useStore((state) => state.setName);
    const [error, setError] = useState("")
    const [isVisible, setIsVisible] = useState(false)
    const router = useRouter()
    const setRoomPlayers = useStore((state) => state.setRoomPlayers);
    const setIsHost = useStore((state) => state.setIsHost);
    const setSettings = useStore((state) => state.setSettings);

    useEffect(() => {
        if (showCreateRoom) {
            setIsVisible(true)
        }
    }, [showCreateRoom])

    useEffect(() => {
        socket.on("room_created", (data) => {
            router.push(`/quiz/${data.roomId}`);
        });
    }, [socket, router]);

    const handleCreateRoom = async () => {
        if (!name) {
            setError("Name is required.");
            return;
        }

        const nanoid = customAlphabet('1234567890', 6);
        const roomId = nanoid();

        socket.emit("create_room", {
            hostName: name,
            roomId: roomId
        });

        socket.on("room_created", (data) => {
            setRoomPlayers(data.players);
            setIsHost(data.isHost);
            setSettings(data.settings);
        });
    };

    const handleClose = () => {
        setIsVisible(false)
    }

    const handleExitComplete = () => {
        if (!isVisible) {
            setShowCreateRoom(false)
        }
    }

    return (
        <AnimatePresence onExitComplete={handleExitComplete}>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    <motion.div
                        className='w-full max-w-md'
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 500 }}
                        onClick={(e) => e.stopPropagation()}
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
                                <Button onClick={handleCreateRoom} className="w-full bg-black hover:bg-gray-800 text-white">
                                    Create Room
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}