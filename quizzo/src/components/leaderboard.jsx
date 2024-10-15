"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import useStore from "@/app/store"
import socket from "@/app/socket"


export default function Leaderboard({ leaderboard, allPlayersFinished, roomId }) {

    const isHost = useStore((state) => state.isHost);

    const handlePlayAgain = () => {
        // Reset the game state here
        socket.emit("play_again", {
            roomId: roomId
        });
    }

    return (
        <div className="bg-white dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl space-y-6">
                <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Leaderboard</h1>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Rank</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                            <TableHead className="text-right">Time (s)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leaderboard
                            .map((player, index) => (
                                <TableRow key={player.name}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell>{player.name}</TableCell>
                                    <TableCell className="text-right">{player.score}</TableCell>
                                    <TableCell className="text-right">{player.time}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
                {!allPlayersFinished ? (
                    <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <p>Waiting for other players to finish...</p>
                    </div>
                ) : (
                    <Button onClick={handlePlayAgain} className="w-full" disabled={!isHost}>
                        Play Again
                    </Button>
                )}
            </div>
        </div>
    )
}