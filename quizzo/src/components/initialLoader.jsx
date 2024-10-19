import React from "react"

export default function Loader() {
    return (
        <div className="absolute min-w-screen min-h-screen flex items-center justify-center h-screen w-screen" aria-label="Loading">
            <div className="flex flex-col gap-3 items-center">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin [animation-duration:0.75s]"></div>
                <div className="text-xs">Hang tight! The server is booting up and will be ready to serve shortly</div>
                <div className="text-xs">The server might have shut down due to inactivity. (Might take a minute or two)</div>
            </div>
        </div>
    )
}