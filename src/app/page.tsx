import PollForm from "@/components/forms/PollForm";
import PollList from '@/components/PollList';
import clientPromise from '@/lib/mongodb';
import { Poll } from '@/types/poll';


async function getRecentPolls(): Promise<Poll[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const pollsCollection = db.collection('polls');

    const polls = await pollsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return JSON.parse(JSON.stringify(polls));
  } catch (error) {
    console.error('Failed to fetch polls:', error);
    return [];
  }
}
export default async function HomePage() {
  const polls = await getRecentPolls();

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24">
      <div className="w-full max-w-lg mb-16">
        <h1 className="text-4xl text-slate-900 font-bold mb-8 text-center">Create a New Poll</h1>
        <PollForm />
      </div>

      <hr className="w-full max-w-lg mb-12 border-gray-300" />

      <div className="w-full max-w-lg">
        <PollList polls={polls} />
      </div>
    </main>
  );
}