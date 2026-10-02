import { ID, tablesDB } from "../lib/appwrite";

const DATABASE_ID = "aora-db";
const TABLE_ID = "likes";

/**
 * Get all likes for a specific video.
 */
export async function getVideoLikes(
    videoId: string
): Promise<number> {
    try {
        const response = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
        });

        return response.rows.filter(
            (row: any) => row.videoId === videoId
        ).length;
    } catch (error) {
        console.error(
            "❌ Failed to get video likes:",
            error
        );

        throw error;
    }
}

/**
 * Check whether the current user has liked a video.
 */
export async function hasUserLikedVideo(
    videoId: string,
    userId: string
): Promise<boolean> {
    try {
        const response = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
        });

        return response.rows.some(
            (row: any) =>
                row.videoId === videoId &&
                row.userId === userId
        );
    } catch (error) {
        console.error(
            "❌ Failed to check like:",
            error
        );

        throw error;
    }
}

/**
 * Like a video.
 */
export async function likeVideo(
    videoId: string,
    userId: string
): Promise<void> {
    try {
        await tablesDB.createRow({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
            rowId: ID.unique(),
            data: {
                videoId,
                userId,
            },
        });

        console.log("❤️ Video liked");
    } catch (error) {
        console.error(
            "❌ Failed to like video:",
            error
        );

        throw error;
    }
}

/**
 * Unlike a video.
 */
export async function unlikeVideo(
    videoId: string,
    userId: string
): Promise<void> {
    try {
        const response = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
        });

        const likeRow = response.rows.find(
            (row: any) =>
                row.videoId === videoId &&
                row.userId === userId
        );

        if (!likeRow) {
            return;
        }

        await tablesDB.deleteRow({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
            rowId: likeRow.$id,
        });

        console.log("🤍 Video unliked");
    } catch (error) {
        console.error(
            "❌ Failed to unlike video:",
            error
        );

        throw error;
    }
}