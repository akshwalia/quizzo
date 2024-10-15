"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
// import { toast } from "@/hooks/use-toast"
import { Copy, Users, AlertCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from 'react';
import socket from '@/app/socket';
import useStore from "@/app/store"
import { useToast } from "@/hooks/use-toast"


const topics = ["General Knowledge", "Science", "History", "Geography", "Sports", "Other"]
const difficulties = ["Easy", "Medium", "Hard"]

export default function Settings({setLoading, roomId}) {
    const { toast } = useToast()

    const roomPlayers = useStore((state) => state.roomPlayers);

    const settings = useStore((state) => state.settings);
    const setSettings = useStore((state) => state.setSettings);

    const [errors, setErrors] = useState({});

    const isHost = useStore((state) => state.isHost);

    const handleSettingsChange = (field, value) => {
        setSettings({ [field]: value })
        setErrors((prev) => ({ ...prev, [field]: "" }))

        socket.emit("update_settings", {
            roomId,
            field,
            value
        });
    }

    const validateSettings = () => {
        const newErrors = {}
        if (!settings.topic) newErrors.topic = "Please select a topic"
        if (settings.topic === "Other" && !settings.customTopic) newErrors.customTopic = "Please enter a custom topic"
        if (settings.questions < 5 || settings.questions > 25) newErrors.questions = "Number of questions must be between 5 and 25"
        if (!settings.difficulty) newErrors.difficulty = "Please select a difficulty"
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSaveSettings = () => {
        if (validateSettings()) {
            setLoading(true);
            socket.emit("start_quiz", {
                roomId
            });
        }
    }

    const copyRoomLink = () => {
        const roomLink = window.location.href
        navigator.clipboard.writeText(roomLink)
            .then(() => {
                toast({
                    title: "Room link copied",
                    description: "The room link has been copied to your clipboard.",
                    duration: 2000
                })
            })
            .catch((err) => {
                console.error('Failed to copy: ', err)
                toast({
                    title: "Failed to copy",
                    description: "There was an error copying the link.",
                    variant: "destructive",
                    duration: 3000
                })
            })
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Quiz Room Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card text-card-foreground rounded-lg p-6 shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Room Information</h2>
                    <div className="flex items-center justify-between mb-4">
                        <span className="font-medium">Room ID: {roomId}</span>
                        <Button variant="outline" onClick={copyRoomLink}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Room Link
                        </Button>
                    </div>
                    <div className="flex items-center text-muted-foreground mb-4">
                        <Users className="mr-2 h-5 w-5" />
                        <span>{roomPlayers.length} Players in the room</span>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Players in Room</h3>
                        <div className="flex flex-wrap gap-2">
                            {roomPlayers.map((player, index) => (
                                <div key={index} className="flex items-center bg-background rounded-full px-3 py-1">
                                    <Avatar className="h-6 w-6 mr-2">
                                        <AvatarImage src={player.avatar} alt={player.name} />
                                        <AvatarFallback>{player.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{player.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-card text-card-foreground rounded-lg p-6 shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Quiz Settings</h2>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="topic">Topic</Label>
                            <Select onValueChange={(value) => handleSettingsChange("topic", value)}
                                value={settings.topic}
                                disabled={!isHost}>
                                <SelectTrigger id="topic">
                                    <SelectValue placeholder="Select a topic" />
                                </SelectTrigger>
                                <SelectContent>
                                    {topics.map((topic) => (
                                        <SelectItem key={topic} value={topic}>
                                            {topic}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.topic && (
                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {errors.topic}
                                </p>
                            )}
                        </div>

                        {settings.topic === "Other" && (
                            <div>
                                <Label htmlFor="customTopic">Custom Topic</Label>
                                <Input
                                    id="customTopic"
                                    value={settings.customTopic}
                                    onChange={(e) => handleSettingsChange("customTopic", e.target.value)}
                                    placeholder="Enter custom topic"
                                    disabled={!isHost}
                                />
                                {errors.customTopic && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {errors.customTopic}
                                    </p>
                                )}
                            </div>
                        )}

                        <div>
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Slider
                                id="duration"
                                min={1}
                                max={5}
                                step={1}
                                value={[settings.duration]}
                                onValueChange={(value) => handleSettingsChange("duration", value[0])}
                                disabled={!isHost}
                            />
                            <div className="text-right text-sm text-muted-foreground mt-1">{settings.duration} minutes</div>
                        </div>

                        <div>
                            <Label htmlFor="questions">Number of Questions</Label>
                            <Input
                                id="questions"
                                type="number"
                                min={5}
                                max={25}
                                value={settings.questions || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '') {
                                        handleSettingsChange("questions", null);
                                    } else {
                                        const numValue = parseInt(value, 10);
                                        if (!isNaN(numValue)) {
                                            handleSettingsChange("questions", numValue);
                                        }
                                    }
                                }}
                                placeholder="Enter number of questions"
                                disabled={!isHost}
                            />
                            {errors.questions && (
                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {errors.questions}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="difficulty">Difficulty</Label>
                            <Select onValueChange={(value) => handleSettingsChange("difficulty", value)}
                                value={settings.difficulty}
                                disabled={!isHost}>
                                <SelectTrigger id="difficulty">
                                    <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    {difficulties.map((difficulty) => (
                                        <SelectItem key={difficulty} value={difficulty}>
                                            {difficulty}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.difficulty && (
                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    {errors.difficulty}
                                </p>
                            )}
                        </div>
                    </div>

                    <Button className="mt-6 w-full" onClick={handleSaveSettings} disabled={!isHost}>Start Quiz</Button>
                </div>
            </div>
        </div>
    )
}