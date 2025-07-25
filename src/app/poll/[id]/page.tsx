import clientPromise from "@/lib/mongodb";
import { Poll } from "@/types/poll";
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import PollDisplay from "@/components/PollDisplay";

async function getPoll(id: string): Promise<Poll | null> {
    try {
        if (!ObjectId.isValid(id)) {
            return null;
        }
        const client = await clientPromise;
        const db = client.db();
        const pollsCollection = db.collection('polls');

        const poll = await pollsCollection.findOne({ _id: new ObjectId(id) });

        if (!poll) return null;

        return JSON.parse(JSON.stringify(poll));
    }
    catch (err) {
        console.log("Database Error in Fetching Poll :", err);
        return null;
    }
}

interface PollPageProps {
  params: Promise<{ id: string }>;
}

export default async function PollPage({ params }: PollPageProps) {
  const { id } = await params;
  const poll = await getPoll(id);

    if(!poll){
        notFound();
    }

    return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <PollDisplay initialPoll={poll} />
    </main>
  );
}