"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: '.env.local' });
const socket_io_1 = require("socket.io");
const mongodb_1 = require("mongodb");
const http_1 = __importDefault(require("http"));
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("Fatal Error : MONGODB_URI not defined");
    process.exit(1);
}
const server = http_1.default.createServer();
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ['GET', 'POST'],
    }
});
const client = new mongodb_1.MongoClient(MONGODB_URI);
const clientPromise = client.connect();
console.log("Socket Server is starting...");
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.on('join-poll', (pollId) => {
        socket.join(pollId);
        console.log(`Client ${socket.id} joined room for poll: ${pollId}`);
    });
    socket.on('vote', async ({ pollId, optionText }) => {
        try {
            const dbClient = await clientPromise;
            const pollsCollection = dbClient.db().collection('polls');
            await pollsCollection.updateOne({ _id: new mongodb_1.ObjectId(pollId), 'options.text': optionText }, { $inc: { "options.$.votes": 1 } });
            const updatePoll = await pollsCollection.findOne({ _id: new mongodb_1.ObjectId(pollId) });
            io.to(pollId).emit('poll-update', JSON.parse(JSON.stringify(updatePoll)));
            console.log(`Vote Cast for ${optionText} in poll ${pollId}. Update broadcasted.`);
        }
        catch (err) {
            console.error("Error processsing the vote: ", err);
            socket.emit('vote-error', 'There was a problem processing your vote.');
        }
    });
    socket.on('disconnect', () => {
        console.log("Client disconnected: ", socket.id);
    });
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Socket.IO server running on: http://localhost:${PORT}`);
});
