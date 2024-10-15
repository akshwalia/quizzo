'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle } from 'lucide-react'

const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function Question({ question, options, correctAnswer, onAnswerSelected, isActive }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [randomizedOptions, setRandomizedOptions] = useState([])

  useEffect(() => {
    if (isActive) {
      setSelectedAnswer(null)
      setShowFeedback(false)
      setRandomizedOptions(shuffleArray(options))
    }
  }, [isActive, options])

  const handleAnswerClick = (answer) => {
    setSelectedAnswer(answer)
    const correct = answer === correctAnswer
    setIsCorrect(correct)
    setShowFeedback(true)
    setTimeout(() => {
      setShowFeedback(false)
      onAnswerSelected(correct)
    }, 1000)
  }

  const getButtonStyle = (option) => {
    if (selectedAnswer === null) {
      return 'bg-gray-200 hover:bg-gray-300'
    }
    
    if (option === correctAnswer) {
      return 'bg-green-500 hover:bg-green-600'
    }
    
    if (selectedAnswer === option) {
      return 'bg-red-500 hover:bg-red-600'
    }
    
    return 'bg-gray-200'
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {randomizedOptions.map((option, index) => (
          <Button
            key={index}
            onClick={() => handleAnswerClick(option)}
            className={`w-full justify-start text-left ${getButtonStyle(option)} text-black`}
            disabled={!isActive || selectedAnswer !== null}
          >
            {option}
          </Button>
        ))}
        {showFeedback && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="flex justify-center items-center"
          >
            {isCorrect ? (
              <CheckCircle2 className="text-green-500 w-16 h-16" />
            ) : (
              <XCircle className="text-red-500 w-16 h-16" />
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}