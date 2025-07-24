import clientPromise from "@/lib/mongodb"
import { Poll } from "@/types/poll"
import { ObjectId } from "mongodb"
import { notFound } from "next/navigation"

interface PollPageProps {
    params : {
        id: string;
    }
}

async function getPoll(id : string) : Promise<Poll | null> {
    try{
        if(!ObjectId.isValid(id)){
            return null;
        }
        
        const client = await clientPromise;
        const db = client.db();
        const pollsCollection = db.collection('polls');

        const poll = await pollsCollection.findOne({_id: new ObjectId(id)});

        if(!poll) return null;

        return JSON.parse(JSON.stringify(poll));
    }
    catch(err){
        console.log("Databse Error in Fetching Poll :", err);
        return null;
    }
}

const PollPage =  async (props : PollPageProps) => {
    const idx = props.params.id;
    const poll = await getPoll(idx);
    if(!poll) {
        notFound();
    }
    return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-2">{poll.question}</h1>
        <p className="text-sm text-gray-500 mb-8">
          Created on: {new Date(poll.createdAt).toLocaleDateString()}
        </p>

        <div className="space-y-4">
          {poll.options.map((option, index) => (
            <div key={index} className="p-4 border rounded-lg shadow-sm">
              <p className="text-xl font-medium">{option.text}</p>
              <p className="text-lg font-semibold mt-2 text-blue-600">{option.votes} votes</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default PollPage