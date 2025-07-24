import Image from "next/image";
import PollForm from "@/components/forms/PollForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-lg">
        <h1 className="text-4xl text-blue-950 font-bold mb-8 text-center">Create a New Poll</h1>
        <PollForm />
      </div>
    </main>
  );
}
