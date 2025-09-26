// lib/mongo.ts
import { MongoClient, Db } from "mongodb";

if (!process.env.DB_URI) {
    throw new Error("❌ Missing DB_URI in environment variables");
}

const client = new MongoClient(process.env.DB_URI);

export async function getDB(dbName: string): Promise<Db> {
    try {
        // Connect MongoDB (aman dipanggil berulang kali)
        await client.connect();
        console.log("✅ Connected to MongoDB");
        return client.db(dbName);
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        throw err;
    }
}
