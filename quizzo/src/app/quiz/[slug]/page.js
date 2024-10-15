'use client'

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import socket from '@/app/socket';
import useStore from '@/app/store';
import NameForm from '@/components/ui/enterName';
import Loader from '@/components/loader';

import Settings from '@/components/multiplayerQuizPage';
import Questions from '@/components/multiplayersQuestions';
import AlertBox from '@/components/alert';



export default function QuizRoom() {
    const [loading, setLoading] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const name = useStore((state) => state.name);
    const [showNameForm, setShowNameForm] = useState(!name);
    const pathname = usePathname();  // Get the full path
    const [roomId, setRoomId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [allPlayersFinished, setAllPlayersFinished] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);
    const [showAlert, setShowAlert] = useState(false);

    const roomPlayers = useStore((state) => state.roomPlayers);
    const setRoomPlayers = useStore((state) => state.setRoomPlayers);

    const settings = useStore((state) => state.settings);
    const setSettings = useStore((state) => state.setSettings);

    const [errors, setErrors] = useState({});

    const router = useRouter();

    useEffect(() => {
        const segments = pathname.split('/');
        const id = segments[segments.length - 1]; // Get the last segment of the path
        setRoomId(id); // Set the roomId
    }, []);

    useEffect(() => {
        socket.on("player_joined", (data) => {
            setRoomPlayers(data.players);
        });

        socket.on("player_left", (data) => {
            setRoomPlayers(data.players);
        });

        socket.on("host_left", (data) => {
            setShowAlert(true);
        });

        socket.on("settings_updated", (data) => {
            // console.log(data.settings);
            setSettings(data.settings);
        });

        socket.on("quiz_started", (data) => {
            setLoading(false);
            setGameStarted(true);
            setQuestions(data.questions);
        });

        socket.on("loading", (data) => {
            setLoading(true);
        });

        socket.on("leaderboard_updated", (data) => {
            setLeaderboard(data.leaderboard);
        });

        socket.on("quiz_over", (data) => {
            setLeaderboard(data.leaderboard);
            setAllPlayersFinished(true);
        });

        socket.on("play_again", () => {
            setAllPlayersFinished(false);
            setGameStarted(false);
            setLeaderboard([]);
        });

        socket.on("room_error", (data) => {
            setAlertMessage(data.message);
            setShowAlert(true);
        });
    }, [socket]);

    

    return (
        <>
            {showAlert && <AlertBox message={alertMessage}/>}
            {loading && <Loader />}
            {showNameForm && <NameForm setShowNameForm={setShowNameForm} />}
            {roomPlayers && !showNameForm && !loading && !gameStarted &&
                <Settings setLoading={setLoading} roomId={roomId} setQuestions={setQuestions}/>
            }
            {
                gameStarted && !loading && 
                    <Questions questions={questions} roomId={roomId} leaderboard={leaderboard} allPlayersFinished={allPlayersFinished}/>
            }
        </>
    )
}