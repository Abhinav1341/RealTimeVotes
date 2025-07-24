import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { Poll } from "@/types/poll";

export async function POST(request: Request) {
    try{
        const client = await clientPromise;
        const db = client.db();
        const pollsCollection = db.collection<Poll>('polls');

        const body = await request.json();
        const {question,options} = body;

        if(!question || typeof question !== 'string' || question.trim().length < 4){
            return NextResponse.json({message : "Question is required and must have more than 4 charectors long."})
        }
        if(!options || !Array.isArray(options) || options.length < 2){
            return NextResponse.json({message : "At least two options are required."})
        }
        for(let op of options){
            if(typeof op !== 'string' || op.trim().length === 0){
                return NextResponse.json({message : "Options can't be left empty."})
            }
        }

        const newPoll: Poll = {
            question: question.trim(),
            options: options.map((optionText: string) => ({
                text: optionText.trim(),
                votes : 0
            })),
            createdAt : new Date(),
        }

        const result = await pollsCollection.insertOne(newPoll);
        return NextResponse.json({
            message: "Poll Created Succesfully",
            pollId: result.insertedId,
        },{status: 201});

    }
    catch(error){
        console.error("Error Creating Poll: ",error);
        return NextResponse.json({
            message: "Error during creating poll.",
        },{status: 500});
    }
}