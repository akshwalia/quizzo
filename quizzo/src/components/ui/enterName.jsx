'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from 'lucide-react'
import useStore from "@/app/store"
import socket from '@/app/socket'
import { usePathname, useRouter } from 'next/navigation'
import AlertBox from '../alert'

const NameForm = ({ setShowNameForm }) => {
    const name = useStore((state) => state.name);
    const [error, setError] = useState("")
    const setName = useStore((state) => state.setName);
    const setRoomPlayers = useStore((state) => state.setRoomPlayers);
    const setIsHost = useStore((state) => state.setIsHost);
    const setSettings = useStore((state) => state.setSettings);
    const [alertMessage, setAlertMessage] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const handleRoomError = (data) => {
            setAlertMessage(data.message);
            setIsLoading(false);
        };

        const handleJoinedRoom = (data) => {
            setRoomPlayers(data.players);
            setIsHost(data.isHost);
            setSettings(data.settings);
            setIsLoading(false);
            setShowNameForm(false);
        };

        socket.on("room_error", handleRoomError);
        socket.on("joined_room", handleJoinedRoom);

        return () => {
            socket.off("room_error", handleRoomError);
            socket.off("joined_room", handleJoinedRoom);
        };
    }, [setRoomPlayers, setIsHost, setSettings, setShowNameForm]);

    useEffect(() => {
        setShowAlert(alertMessage ? true : false);
    }, [alertMessage]);

    const handleJoinRoom = async () => {
        if (!name) {
            setError("Name is required.");
            return;
        }

        setError("");
        setIsLoading(true);
        setName(name);

        const segments = pathname.split('/');
        const id = segments[segments.length - 1]; // Get the last segment of the path

        socket.emit("join_room", {
            playerName: name,
            roomId: id
        });
    };

    return (
        <>
            {showAlert && <AlertBox message={alertMessage} setShowAlert={setShowAlert} />}
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
            >
                <motion.div
                    className='w-full max-w-md'
                >
                    <Card className="w-full bg-white">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-center">Join Room</CardTitle>
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
                            <Button 
                                onClick={handleJoinRoom} 
                                className="w-full bg-black hover:bg-gray-800 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Joining...
                                    </>
                                ) : (
                                    'Join Room'
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </motion.div>
        </>
    )
}

export default NameForm