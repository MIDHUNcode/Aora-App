import { ID, tablesDB } from "../lib/appwrite";

const DATABASE_ID = "aora-db";
const TABLE_ID = "comments";

export type Comment = {
    id: string;
    videoId: string;
    userId: string;
    userName: string;
    text: string;
    createdAt: string;
};

/**
 * Get all comments for a video.
 */
export async function getVideoComments(
    videoId: string
): Promise<Comment[]> {
    try {
        const response = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
        });

        return response.rows
            .filter(
                (row: any) =>
                    row.videoId === videoId
            )
            .map((row: any) => ({
                id: row.$id,
                videoId: row.videoId,
                userId: row.userId,
                userName: row.userName,
                text: row.text,
                createdAt: row.$createdAt,
            }))
            .sort(
                (a, b) =>
                    new Date(
                        b.createdAt
                    ).getTime() -
                    new Date(
                        a.createdAt
                    ).getTime()
            );
    } catch (error) {
        console.error(
            "❌ Failed to get video comments:",
            error
        );

        throw error;
    }
}

/**
 * Add a comment to a video.
 */
export async function addComment(
    videoId: string,
    userId: string,
    userName: string,
    text: string
): Promise<Comment> {
    try {
        const response =
            await tablesDB.createRow({
                databaseId: DATABASE_ID,
                tableId: TABLE_ID,
                rowId: ID.unique(),
                data: {
                    videoId,
                    userId,
                    userName,
                    text: text.trim(),
                },
            });

        console.log(
            "💬 Comment added:",
            response.$id
        );

        return {
            id: response.$id,
            videoId: response.videoId,
            userId: response.userId,
            userName: response.userName,
            text: response.text,
            createdAt: response.$createdAt,
        };
    } catch (error) {
        console.error(
            "❌ Failed to add comment:",
            error
        );

        throw error;
    }
}

/**
 * Delete a comment.
 */
export async function deleteComment(
    commentId: string
): Promise<void> {
    try {
        await tablesDB.deleteRow({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
            rowId: commentId,
        });

        console.log(
            "🗑️ Comment deleted:",
            commentId
        );
    } catch (error) {
        console.error(
            "❌ Failed to delete comment:",
            error
        );

        throw error;
    }
}

export async function getVideoCommentCount(
    videoId: string
): Promise<number> {
    try {
        const response = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
        });

        return response.rows.filter(
            (row: any) =>
                row.videoId === videoId
        ).length;
    } catch (error) {
        console.error(
            "❌ Failed to get comment count:",
            error
        );

        throw error;
    }
}