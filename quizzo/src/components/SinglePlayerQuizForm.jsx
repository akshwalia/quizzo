"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import useStore from "@/app/store"

export default function QuizPlayPage({ setLoading, setQuizStarted }) {
    const [topic, setTopic] = useState("")
    const [otherTopic, setOtherTopic] = useState("")
    const [timeLimit, setTimeLimit] = useState("")
    const [numQuestions, setNumQuestions] = useState("")
    const [errors, setErrors] = useState({})
    const [difficulty, setDifficulty] = useState("");

    const getQuestions = useStore((state) => state.getQuestions)
    const setQuestions = useStore((state) => state.setQuestions)
    const questions = useStore((state) => state.questions)

    const topics = [
        "Politics",
        "Animals",
        "Geography",
        "Cinema",
        "Anime",
        "Pokemon",
        "Technology",
        "Science",
        "Other"
    ]

    const timeLimits = [
        { value: "30", label: "30 seconds" },
        { value: "60", label: "1 minute" }
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()
        const formErrors = validateForm()
        if (Object.keys(formErrors).length === 0) {
            const selectedTopic = topic === "Other" ? otherTopic : topic
            console.log("Topic:", selectedTopic, "Time Limit:", timeLimit, "Number of Questions:", numQuestions)
            setErrors({})

            setLoading(true)
            setQuizStarted(true)

            const data = await getQuestions(selectedTopic, numQuestions, difficulty);
            setQuestions(data)

        } else {
            setErrors(formErrors)
        }
    }

    const handleNumQuestionsChange = (e) => {
        const value = e.target.value
        setNumQuestions(value)
        validateNumQuestions(value)
    }

    const validateNumQuestions = (value) => {
        if (value === "") {
            setErrors(prev => ({ ...prev, numQuestions: "Number of questions is required" }))
        } else if (parseInt(value) < 5 || parseInt(value) > 25) {
            setErrors(prev => ({ ...prev, numQuestions: "Number of questions must be between 5 and 25" }))
        } else {
            setErrors(prev => ({ ...prev, numQuestions: undefined }))
        }
    }

    const validateForm = () => {
        let formErrors = {}
        if(!difficulty) formErrors.difficulty = "Difficulty is required";
        if (!topic) formErrors.topic = "Topic is required"
        if (topic === "Other" && !otherTopic.trim()) formErrors.otherTopic = "Please specify the topic"
        if (!timeLimit) formErrors.timeLimit = "Time limit is required"
        if (!numQuestions) {
            formErrors.numQuestions = "Number of questions is required"
        } else if (parseInt(numQuestions) < 5 || parseInt(numQuestions) > 25) {
            formErrors.numQuestions = "Number of questions must be between 5 and 25"
        }

        return formErrors
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center mb-6 text-black">Start Your Quiz</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="topic" className="text-black">Topic</Label>
                        <Select value={topic} onValueChange={setTopic}>
                            <SelectTrigger id="topic" className="w-full mt-1 border-gray-300 focus:border-black focus:ring-black">
                                <SelectValue placeholder="Select a topic" />
                            </SelectTrigger>
                            <SelectContent>
                                {topics.map((t) => (
                                    <SelectItem key={t} value={t}>
                                        {t}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.topic && <p className="mt-1 text-sm text-red-600" role="alert">{errors.topic}</p>}
                    </div>
                    {topic === "Other" && (
                        <div>
                            <Label htmlFor="otherTopic" className="text-black">Specify Topic</Label>
                            <Input
                                id="otherTopic"
                                type="text"
                                value={otherTopic}
                                onChange={(e) => setOtherTopic(e.target.value)}
                                className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                            />
                            {errors.otherTopic && <p className="mt-1 text-sm text-red-600" role="alert">{errors.otherTopic}</p>}
                        </div>
                    )}
                    <div>
                        <Label htmlFor="timeLimit" className="text-black">Time Limit</Label>
                        <Select value={timeLimit} onValueChange={setTimeLimit}>
                            <SelectTrigger id="timeLimit" className="w-full mt-1 border-gray-300 focus:border-black focus:ring-black">
                                <SelectValue placeholder="Select time limit" />
                            </SelectTrigger>
                            <SelectContent>
                                {timeLimits.map((limit) => (
                                    <SelectItem key={limit.value} value={limit.value}>
                                        {limit.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.timeLimit && <p className="mt-1 text-sm text-red-600" role="alert">{errors.timeLimit}</p>}
                    </div>
                    <div>
                        <Label htmlFor="numQuestions" className="text-black">Number of Questions (5-25)</Label>
                        <Input
                            id="numQuestions"
                            type="number"
                            value={numQuestions}
                            onChange={handleNumQuestionsChange}
                            className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                        />
                        {errors.numQuestions && <p className="mt-1 text-sm text-red-600" role="alert">{errors.numQuestions}</p>}
                    </div>
                    <div>
                        <Label htmlFor="diificulty" className="text-black">Difficulty</Label>
                        <Select value={difficulty} onValueChange={setDifficulty}>
                            <SelectTrigger id="difficulty" className="w-full mt-1 border-gray-300 focus:border-black focus:ring-black">
                                <SelectValue placeholder="Select a difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem key={"Easy"} value={"Easy"}>
                                    Easy
                                </SelectItem>
                                <SelectItem key={"Medium"} value={"Medium"}>
                                    Medium
                                </SelectItem>
                                <SelectItem key={"Hard"} value={"Hard"}>
                                    Hard
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.difficulty && <p className="mt-1 text-sm text-red-600" role="alert">{errors.difficulty}</p>}
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-black text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Start Game
                    </Button>
                </form>
            </div>
        </div>
    )
}