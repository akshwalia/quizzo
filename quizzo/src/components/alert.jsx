"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function AlertBox({ message = "Action completed successfully!" }) {
  const [countdown, setCountdown] = useState(3)
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => {
      if(countdown!==0)
        setCountdown((prevCount) => prevCount - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (countdown === 0) {
      router.push("/")
    }
  }, [countdown, router])

  return (
    <div className="flex items-center justify-center min-h-screen absolute backdrop-blur-md w-screen z-10">
      <Alert className="w-full max-w-md" variant="default">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Attention</AlertTitle>
        <AlertDescription>
          {message}
          <p className="mt-2">Redirecting to homepage in {countdown} seconds...</p>
        </AlertDescription>
      </Alert>
    </div>
  )
}