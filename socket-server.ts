import * as dotenv from 'dotenv'
dotenv.config({path: '.env.local'})

import {Server,Socket} from 'socket.io';
import { MongoClient, ObjectId } from 'mongodb';
import http from 'http';

const MONGODB_URI = process.env.MONGODB_URI;
if(!MONGODB_URI){
    console.error("Fatal Error : MONGODB_URI not defined");
    process.exit(1);
}

const server = http.createServer();
const io = new Server(server,{
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ['GET','POST'],
    }
})

const client = new MongoClient(MONGODB_URI);
const clientPromise = client.connect();

console.log("Socket Server is starting...");

io.on('connection',(socket:Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join-poll', (pollId:string) => {
        socket.join(pollId);
        console.log(`Client ${socket.id} joined room for poll: ${pollId}`);
    });

    socket.on('vote', async ({pollId,optionText} : {pollId : string; optionText: string}) => {
        try{
            const dbClient = await clientPromise;
            const pollsCollection = dbClient.db().collection('polls');

            await pollsCollection.updateOne(
                {_id: new ObjectId(pollId), 'options.text': optionText},
                {$inc: {"options.$.votes" : 1} }
            );

            const updatePoll = await pollsCollection.findOne({ _id: new ObjectId(pollId)});

            io.to(pollId).emit('poll-update', JSON.parse(JSON.stringify(updatePoll)));
            console.log(`Vote Cast for ${optionText} in poll ${pollId}. Update broadcasted.`);
        }
        catch(err){
            console.error("Error processsing the vote: ", err);
            socket.emit('vote-error', 'There was a problem processing your vote.')
        }
    });

    socket.on('disconnect', () => {
        console.log("Client disconnected: ",socket.id);
    });
});

const PORT = process.env.PORT || 3001;

server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Socket server is alive and listening on port: ${PORT}`);
})