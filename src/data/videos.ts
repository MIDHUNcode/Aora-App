export type Video = {
    id: string;
    title: string;
    creator: string;
    views: string;
    time: string;
    image: string;
    description: string;
};

export const videos: Video[] = [
    {
        id: "1",
        title: "Build a React Native App",
        creator: "Midhun G",
        views: "12K views",
        time: "2 hours ago",
        image:
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000",
        description:
            "Learn how to build a modern React Native application from scratch. In this video, we explore components, navigation, styling, and application structure.",
    },
    {
        id: "2",
        title: "MERN Stack Project Setup",
        creator: "Code With Midhun",
        views: "8.4K views",
        time: "5 hours ago",
        image:
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000",
        description:
            "Learn how to set up a complete MERN stack project using MongoDB, Express, React, and Node.js.",
    },
    {
        id: "3",
        title: "Learn TypeScript Easily",
        creator: "Dev Academy",
        views: "15K views",
        time: "1 day ago",
        image:
            "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1000",
        description:
            "Understand TypeScript fundamentals and learn how to use types effectively in modern JavaScript applications.",
    },
];

