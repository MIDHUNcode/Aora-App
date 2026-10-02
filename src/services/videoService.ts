import { getVideos, tablesDB } from "../lib/appwrite";

export type Video = {
    id: string;
    userId?: string;
    title: string;
    creator: string;
    views: string;
    time: string;
    image: string;
    description: string;
    videoFileId?: string;
    thumbnailFileId?: string;
};

export async function fetchVideos(): Promise<Video[]> {
    const rows = await getVideos();

    return rows.map((row: any) => ({
        id: row.videoId,
        userId: row.userId,
        title: row.title,
        creator: row.creator,
        views: row.views,
        time: row.time,
        image: row.image,
        description: row.description,
        videoFileId: row.videoFileId,
        thumbnailFileId: row.thumbnailFileId,
    }));
}   

export async function fetchMyVideos(
    userId: string
): Promise<Video[]> {
    try {
        const response = await tablesDB.listRows({
            databaseId: "aora-db",
            tableId: "videos",
        });

        return response.rows
            .filter((row: any) => row.userId === userId)
            .map((row: any) => ({
                id: row.videoId,
                userId: row.userId,
                title: row.title,
                creator: row.creator,
                views: row.views,
                time: row.time,
                image: row.image,
                description: row.description,
                videoFileId: row.videoFileId,
                thumbnailFileId: row.thumbnailFileId,
            }));
    } catch (error) {
        console.error(
            "❌ Failed to fetch my videos:",
            error
        );

        throw error;
    }
}