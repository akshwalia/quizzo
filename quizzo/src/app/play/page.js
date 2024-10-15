"use client"

import { useState, useEffect } from "react"
import QuizPlayPage from "@/components/SinglePlayerQuizForm"
import Loader from "@/components/loader"
import Questions from "@/components/questions"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import useStore from "@/app/store"

export default function Play() {
  const [loading, setLoading] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const router = useRouter()
  const questions = useStore((state) => state.questions)

  useEffect(() => {
    if (questions.length > 0) {
      setQuizStarted(true)
      setLoading(false)
    }
  }, [questions])

  const handleBackToHome = () => {
    router.push('/')
  }

  return (
    <div className="relative min-h-screen flex justify-center">
      <div className="absolute top-4 left-4 z-10">
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleBackToHome}
          className="bg-white hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="sm:min-w-[30rem] pt-16">
        {!quizStarted && <QuizPlayPage setLoading={setLoading} setQuizStarted={setQuizStarted}/>}
        {quizStarted && !loading && <Questions questions={questions} setQuizStarted={setQuizStarted}/>}
      </div>
      {loading && <Loader />}
    </div>
  )
}