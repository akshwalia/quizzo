'use client'

import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Film, Tv, Gamepad2, Cpu, FlaskConical, Dog, Users, PlusCircle, LogIn } from 'lucide-react'

import { CreateRoomCard } from '@/components/ui/createRoom'
import { JoinRoomCard } from '@/components/ui/joinRoom'
import { useEffect, useState } from 'react'
import Loader from '@/components/initialLoader'

import Link from 'next/link'

import socket from './socket'
import { customAlphabet } from 'nanoid'
import { useRouter } from 'next/navigation'

const quizzes = [
  { name: "Globe Trotter", topic: "Geography", icon: Globe, description: "Explore the world's wonders and test your knowledge of countries, capitals, and landmarks." },
  { name: "Silver Screen Showdown", topic: "Cinema", icon: Film, description: "Lights, camera, action! Dive into the world of movies, directors, and iconic film moments." },
  { name: "Otaku Challenge", topic: "Anime", icon: Tv, description: "Prove your anime expertise with questions on popular series, characters, and Japanese culture." },
  { name: "Pocket Monster Mastery", topic: "Pokemon", icon: Gamepad2, description: "Gotta answer 'em all! Show off your Pokemon knowledge from all generations." },
  { name: "Tech Titans", topic: "Technology", icon: Cpu, description: "From Silicon Valley to cutting-edge innovations, test your tech savvy in this electrifying quiz." },
  { name: "Mad Scientist", topic: "Science", icon: FlaskConical, description: "Experiment with questions on biology, chemistry, physics, and other scientific disciplines." },
  { name: "Wild Kingdom", topic: "Animals", icon: Dog, description: "Unleash your inner zoologist and tackle questions about the animal kingdom's diversity." },
  { name: "People's Choice", topic: "Politics", icon: Users, description: "Navigate the complex world of politics, from historical events to current affairs." },
]

export default function Home() {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    function onConnect() {
      setLoading(false);
      console.log('Connected to server');
    }

    function onDisconnect() {
      console.log('Disconnected from server');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Check if the page has finished loading
    if (document.readyState === 'complete') {
      setLoading(false);
    } else {
      window.addEventListener('load', () => setLoading(false));
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      window.removeEventListener('load', () => setLoading(false));
    };
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    const handleRouteChange = () => {
      setLoading(false);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.isReady]);

  return (
    <>
      {loading && <Loader />}
      {showCreateRoom && <CreateRoomCard showCreateRoom={showCreateRoom} setShowCreateRoom={setShowCreateRoom} />}
      {showJoinRoom && <JoinRoomCard showJoinRoom={showJoinRoom} setShowJoinRoom={setShowJoinRoom} />}
      {!loading &&
        <div className="min-h-screen bg-white p-8">
          <header className="flex flex-col gap-10 justify-between items-center mb-8 space-y-4 md:space-y-0">
            <h1 className="text-4xl font-bold text-black">Quizzo</h1>
            <p className="text-lg text-gray-700 text-center max-w-2xl">
              Welcome to Quizzo, the ultimate live quiz game platform! Compete with friends in real-time across various exciting topics. Create a room to host your own quiz or join an existing one to test your knowledge. Get ready for a fun, challenging, and educational experience!
            </p>
          </header>
          <div className="mb-4 flex justify-center">
            <div className="flex items-center space-x-4">
              <Button className="bg-black hover:bg-gray-800 text-white" onClick={() => setShowCreateRoom(true)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Room
              </Button>
              <Button className="bg-white hover:bg-gray-100 text-black border border-black" onClick={() => setShowJoinRoom(true)}>
                <LogIn className="w-4 h-4 mr-2" />
                Join Room
              </Button>
            </div>
          </div>
          <div className="flex justify-center mb-14">
            <div className='mr-1'>No friends? </div> <Link href="/play" className='underline'>Play alone</Link>
          </div>
          <main className="text-center">
            <h2 className="text-3xl font-semibold text-black mb-8">Discover Quizzes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {quizzes.map((quiz, index) => (
                <div
                  key={quiz.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full bg-white border border-gray-200">
                    <CardHeader className="bg-black text-white p-4">
                      <CardTitle className="flex flex-col gap-3 items-center justify-center space-x-2 text-lg">
                        <quiz.icon className="w-14 h-14" />
                        <span>{quiz.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 mb-2 font-bold">{quiz.topic}</p>
                      <p className="text-sm text-gray-700">{quiz.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </main>
        </div>
      }
    </>
  )
}