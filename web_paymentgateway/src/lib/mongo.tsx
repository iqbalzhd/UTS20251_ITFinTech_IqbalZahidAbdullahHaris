// lib/mongo.ts
import { MongoClient, Db, Collection, Document } from "mongodb";

if (!process.env.DB_URI) {
    throw new Error("❌ Missing DB_URI in environment variables");
}

const client = new MongoClient(process.env.DB_URI);
const dbName = process.env.DB_NAME;

// Fungsi ambil DB
async function getDB(): Promise<Db> {
    await client.connect();
    return client.db(dbName);
}

// Fungsi ambil Collection
export async function getData<T extends Document = Document>(
    collectionName: string
): Promise<Collection<T>> {
    try {
        const db = await getDB();
        console.log("✅ Connected to MongoDB");
        return db.collection<T>(collectionName);
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        throw err;
    }
}
