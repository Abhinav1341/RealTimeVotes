import Link from "next/link"
import { Poll } from "@/types/poll"

interface PollListProps {
    polls: Poll[]
}

export default function PollList({polls}:PollListProps){
    if (!polls || polls.length === 0) {
        return <p className="text-center text-gray-500">No polls have been created yet.</p>;
    }
    return (
    <div className="w-full text-slate-600">
      <h2 className="text-2xl font-bold text-center mb-6 text-slate-900">Or Check Out These Polls</h2>
      <div className="space-y-4">
        {polls.map((poll) => (
          <Link
            href={`/poll/${poll._id}`}
            key={poll._id}
            className="block p-4 border rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-slate-700"
          >
            <p className="text-lg font-semibold">{poll.question}</p>
            <p className="text-sm text-gray-500 mt-1">
              {poll.options.reduce((acc, opt) => acc + opt.votes, 0)} votes
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}