// src/store/useStore.js
import { create } from 'zustand'

const useStore = create((set) => ({
    questions: [],
    setQuestions: (questions) => set({ questions }),

    getQuestions: async (topic, numQuestions, difficulty) => {
        try {
            const response = await fetch("http://localhost:3001/getQuestions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    topic: topic,
                    numQuestions: numQuestions,
                    difficulty: difficulty
                })
            });


            const data = await response.json();;

            return data;
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    },
    name: "",
    setName: (name) => set({ name }),
    roomPlayers: [],
    setRoomPlayers: (players) => set({ roomPlayers: players }),
    settings: {
        topic: "",
        customTopic: "",
        duration: 2,
        questions: 10,
        difficulty: "",
    }, 
    setSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
    })),
    isHost: false,
    setIsHost: (isHost) => set({ isHost })
}))

export default useStore