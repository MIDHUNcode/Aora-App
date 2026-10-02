import {
    Client,
    ID,
    Storage,
    TablesDB,
} from "react-native-appwrite";

export const client = new Client()
    .setEndpoint("https://sgp.cloud.appwrite.io/v1")
    .setProject("aora");

export const tablesDB = new TablesDB(client);

export const storage = new Storage(client);

export { ID };

export async function getVideos() {
    try {
        const response = await tablesDB.listRows({
            databaseId: "aora-db",
            tableId: "videos",
        });

        console.log("✅ Appwrite videos:", response.rows);

        return response.rows;
    } catch (error) {
        console.error("❌ Failed to fetch videos:", error);
        throw error;
    }
}

export function getVideoUrl(fileId: string) {
    return `${client.config.endpoint}/storage/buckets/videos/files/${fileId}/view?project=${client.config.project}`;
}

export function getThumbnailUrl(fileId: string) {
    return `${client.config.endpoint}/storage/buckets/videos/files/${fileId}/view?project=${client.config.project}`;
}