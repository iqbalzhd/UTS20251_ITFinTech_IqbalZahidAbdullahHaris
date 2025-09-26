// app/check-db/page.tsx
import { getDB } from "@/lib/mongo";

export default async function CheckDB() {
    try {
        const db = await getDB("uts_fintech"); // ganti "testdb" dengan nama DB kamu
        const collections = await db.listCollections().toArray();

        return (
            <div className="p-6">
                <h1 className="text-xl font-bold text-green-600">✅ Connected to MongoDB</h1>
                <p>Database name: {db.databaseName}</p>
                <h2 className="mt-4 font-semibold">Collections:</h2>
                <ul className="list-disc ml-6">
                    {collections.map((col) => (
                        <li key={col.name}>{col.name}</li>
                    ))}
                </ul>
            </div>
        );
    } catch (err: any) {
        return (
            <div className="p-6">
                <h1 className="text-xl font-bold text-red-600">❌ Failed to connect</h1>
                <p>{err.message}</p>
            </div>
        );
    }
}
