import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from 'lucide-react'
import socket from '@/app/socket'
import useStore from '@/app/store'
import { useRouter } from 'next/navigation'

export function JoinRoomCard({ showJoinRoom, setShowJoinRoom }) {
  const [roomId, setRoomId] = useState("")
  const [error, setError] = useState("")
  const [isVisible, setIsVisible] = useState(false)

  const setRoomPlayers = useStore((state) => state.setRoomPlayers);
  const name = useStore((state) => state.name);
  const setName = useStore((state) => state.setName);

  const router = useRouter();

  useEffect(() => {
    if (showJoinRoom) {
      setIsVisible(true)
    }
  }, [showJoinRoom])

  const handleJoinRoom = () => {
    if (!name || !roomId) {
      setError("Please fill in all fields")
      return
    }
    // Reset form
    
    socket.emit("join_room", {
      playerName: name,
      roomId: roomId
    });

    socket.on("joined_room", (data) => {
      setRoomPlayers(data.players);
      router.push(`/quiz/${roomId}`);
    });


  }

  const handleClose = () => {
    setIsVisible(false)
  }

  const handleExitComplete = () => {
    if (!isVisible) {
      setShowJoinRoom(false)
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
            <Card className="w-full max-w-md bg-white">
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-id">Room ID</Label>
                  <Input
                    id="room-id"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Enter room ID"
                    className="bg-white border-gray-300"
                  />
                </div>
                {error && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleJoinRoom} className="w-full bg-black hover:bg-gray-800 text-white">
                  Join Room
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}