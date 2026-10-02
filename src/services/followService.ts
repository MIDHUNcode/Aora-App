import { ID, tablesDB } from "../lib/appwrite";

const DATABASE_ID = "aora-db";
const TABLE_ID = "follows";

export async function isFollowing(
    followerId: string,
    followingId: string
): Promise<boolean> {
    try {
        const response = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
        });

        return response.rows.some(
            (row: any) =>
                row.followerId === followerId &&
                row.followingId === followingId
        );
    } catch (error) {
        console.error(
            "❌ Failed to check follow:",
            error
        );

        throw error;
    }
}

export async function followUser(
    followerId: string,
    followingId: string
): Promise<void> {
    try {
        await tablesDB.createRow({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
            rowId: ID.unique(),
            data: {
                followerId,
                followingId,
            },
        });

        console.log("👤 User followed");
    } catch (error) {
        console.error(
            "❌ Failed to follow user:",
            error
        );

        throw error;
    }
}

export async function unfollowUser(
    followerId: string,
    followingId: string
): Promise<void> {
    try {
        const response = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
        });

        const followRow = response.rows.find(
            (row: any) =>
                row.followerId === followerId &&
                row.followingId === followingId
        );

        if (!followRow) {
            return;
        }

        await tablesDB.deleteRow({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
            rowId: followRow.$id,
        });

        console.log("👤 User unfollowed");
    } catch (error) {
        console.error(
            "❌ Failed to unfollow user:",
            error
        );

        throw error;
    }
}

export async function getFollowerCount(
    userId: string
): Promise<number> {
    try {
        const response = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
        });

        return response.rows.filter(
            (row: any) =>
                row.followingId === userId
        ).length;
    } catch (error) {
        console.error(
            "❌ Failed to get follower count:",
            error
        );

        throw error;
    }
}
export async function getFollowingCount(
    userId: string
): Promise<number> {
    try {
        const response = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
        });

        return response.rows.filter(
            (row: any) =>
                row.followerId === userId
        ).length;
    } catch (error) {
        console.error(
            "❌ Failed to get following count:",
            error
        );

        throw error;
    }
}
export async function getFollowingUserIds(
    userId: string
): Promise<string[]> {
    try {
        const response = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: TABLE_ID,
        });

        return response.rows
            .filter(
                (row: any) =>
                    row.followerId === userId
            )
            .map(
                (row: any) =>
                    row.followingId
            );
    } catch (error) {
        console.error(
            "❌ Failed to get following users:",
            error
        );

        throw error;
    }
}