import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

type BookmarkContextType = {
    bookmarkedIds: string[];
    isBookmarked: (id: string) => boolean;
    toggleBookmark: (id: string) => void;
};

const BookmarkContext = createContext<
    BookmarkContextType | undefined
>(undefined);

const BOOKMARKS_STORAGE_KEY = "@aora_bookmarks";

export function BookmarkProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(
        []
    );

    const [isLoaded, setIsLoaded] = useState(false);

    // Load bookmarks when the app starts
    useEffect(() => {
        const loadBookmarks = async () => {
            try {
                const storedBookmarks =
                    await AsyncStorage.getItem(
                        BOOKMARKS_STORAGE_KEY
                    );

                if (storedBookmarks) {
                    const parsedBookmarks =
                        JSON.parse(storedBookmarks);

                    if (Array.isArray(parsedBookmarks)) {
                        setBookmarkedIds(parsedBookmarks);
                    }
                }
            } catch (error) {
                console.error(
                    "Failed to load bookmarks:",
                    error
                );
            } finally {
                setIsLoaded(true);
            }
        };

        loadBookmarks();
    }, []);

    // Save bookmarks whenever they change
    useEffect(() => {
        if (!isLoaded) {
            return;
        }

        const saveBookmarks = async () => {
            try {
                await AsyncStorage.setItem(
                    BOOKMARKS_STORAGE_KEY,
                    JSON.stringify(bookmarkedIds)
                );
            } catch (error) {
                console.error(
                    "Failed to save bookmarks:",
                    error
                );
            }
        };

        saveBookmarks();
    }, [bookmarkedIds, isLoaded]);

    const isBookmarked = (id: string) => {
        return bookmarkedIds.includes(id);
    };

    const toggleBookmark = (id: string) => {
        setBookmarkedIds((currentIds) => {
            if (currentIds.includes(id)) {
                return currentIds.filter(
                    (bookmarkId) => bookmarkId !== id
                );
            }

            return [...currentIds, id];
        });
    };

    return (
        <BookmarkContext.Provider
            value={{
                bookmarkedIds,
                isBookmarked,
                toggleBookmark,
            }}
        >
            {children}
        </BookmarkContext.Provider>
    );
}

export function useBookmarks() {
    const context = useContext(BookmarkContext);

    if (!context) {
        throw new Error(
            "useBookmarks must be used inside BookmarkProvider"
        );
    }

    return context;
}

