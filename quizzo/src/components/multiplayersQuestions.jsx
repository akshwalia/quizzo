'use client'

import { Question } from '@/components/ui/question'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Progress } from "@/components/ui/progress"
import React, { useState, useEffect } from 'react'
import socket from '@/app/socket'
import Leaderboard from './leaderboard'

export default function Questions({ questions, roomId, leaderboard, allPlayersFinished}) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [score, setScore] = useState(0)
    const [isQuestionActive, setIsQuestionActive] = useState(true)

    useEffect(() => {
        setIsQuestionActive(true)
        if(currentQuestionIndex == questions.length){
            socket.emit("quiz_completed", {
                roomId: roomId,
                score: score
            });
        };
    }, [currentQuestionIndex])

    const handleAnswerSelected = (isCorrect) => {
        setIsQuestionActive(false)
        if (isCorrect) {
            setScore(score + 1)
        }
        setTimeout(() => {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        }, 800)
    }

    const handlePlayAgain = () => {
        console.log("Play again");
    };

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Quizzo</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center mb-2">
                        <span>Question {currentQuestionIndex + 1 > questions.length? questions.length: currentQuestionIndex + 1} of {questions.length}</span>
                        <span>Score: {score}</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                </CardContent>
            </Card>

            {currentQuestionIndex < questions.length ? (
                <Question
                    question={questions[currentQuestionIndex].question}
                    options={questions[currentQuestionIndex].options}
                    correctAnswer={questions[currentQuestionIndex].correct_option}
                    onAnswerSelected={handleAnswerSelected}
                    isActive={isQuestionActive}
                />
            ) : (
                <Card>
                    <CardContent className="text-center py-8">
                        <Leaderboard leaderboard={leaderboard} allPlayersFinished={allPlayersFinished} roomId={roomId}/>
                    </CardContent>
                </Card>
            )}
        </div>
    )
};