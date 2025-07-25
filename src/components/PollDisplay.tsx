'use client';
import { useState, useEffect, useRef } from "react";
import io, { Socket } from 'socket.io-client';
import { Poll } from "@/types/poll";

interface PollDisplayProps {
    initialPoll: Poll;
}

export default function PollDisplay({ initialPoll }: PollDisplayProps) {
    const [poll, setPoll] = useState(initialPoll);
    const [hasVoted, setHasVoted] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const totalVotes = poll.options.reduce((acc, option) => acc + option.votes, 0);

    useEffect(() => {
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
        if (poll._id && votedPolls.includes(poll._id)) {
            setHasVoted(true);
        }
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:3001";
        const socket = io(socketUrl);
        socketRef.current = socket;
        
        socket.emit('join-poll', poll._id);
        
        socket.on('poll-update', (updatedPoll: Poll) => {
            setPoll(updatedPoll);
        });

        return () => {
            socket.disconnect();
        };
    }, [poll._id]);

    const handleVote = (optionText: string) => {
        if (hasVoted || !socketRef.current) {
            return;
        }
        socketRef.current.emit('vote', { pollId: poll._id, optionText });
        const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
        votedPolls.push(poll._id);
        localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
        setHasVoted(true);
    };

    return (
        <div className="w-full max-w-2xl">
            <h1 className="text-4xl font-bold text-slate-900 mb-2 text-center">{poll.question}</h1>
            <p className="text-sm text-gray-500 mb-8 text-center">
                Total Votes: <span className="font-bold">{totalVotes}</span>
                {hasVoted && <span className="ml-4 font-semibold text-blue-600">(You have already voted)</span>}
            </p>
            <div className="space-y-4">
                {poll.options.map((option) => {
                    const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                    return (
                        <div key={option.text} className="text-slate-800">
                            <button
                                onClick={() => handleVote(option.text)}
                                disabled={hasVoted}
                                className="w-full text-left p-4 border rounded-lg shadow-sm hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xl font-medium">{option.text}</span>
                                    <span className="text-lg font-semibold">{percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div
                                        className={`${hasVoted ? 'bg-gray-400' : 'bg-blue-600'} h-4 rounded-full transition-all duration-500`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}