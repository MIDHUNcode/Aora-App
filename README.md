# Aora

A modern video-sharing mobile application built with **React Native, Expo, NativeWind, and Appwrite**.

Aora allows users to authenticate, browse videos, search content, bookmark videos, view profiles, and publish video content.

## 📱 Features

* 🔐 User authentication
* 🏠 Home video feed
* 🔎 Video search
* 🎥 Video creation and publishing
* 🔖 Bookmark videos
* 👤 User profile
* 🌙 Light and dark theme support
* 📱 Responsive mobile UI
* ☁️ Appwrite backend integration
* 💾 Persistent authentication and bookmarks

## 🛠️ Tech Stack

### Frontend

* React Native
* Expo
* Expo Router
* TypeScript
* NativeWind
* Tailwind CSS

### Backend

* Appwrite
* Appwrite Database
* Appwrite Storage

### Libraries

* `expo-image-picker`
* `expo-video`
* `expo-font`
* `@react-native-async-storage/async-storage`
* `react-native-appwrite`

## 📂 Project Structure

```text
Aora/
├── assets/
│   └── fonts/
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   └── signup.tsx
│   │   │
│   │   ├── (tabs)/
│   │   │   ├── index.tsx
│   │   │   ├── search.tsx
│   │   │   ├── create.tsx
│   │   │   ├── bookmark.tsx
│   │   │   └── profile.tsx
│   │   │
│   │   ├── video/
│   │   │   └── [id].tsx
│   │   │
│   │   ├── explore.tsx
│   │   └── _layout.tsx
│   │
│   ├── components/
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── BookmarkContext.tsx
│   │
│   └── ...
│
├── app.json
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/MIDHUNcode/Aora.git
```

```bash
cd Aora
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Appwrite

Create an Appwrite project and configure the required:

* Project ID
* Endpoint
* Database
* Tables
* Storage bucket

Add the required configuration to your project according to your local setup.

> Do not commit API keys, secrets, or private credentials to GitHub.

### 4. Start the development server

```bash
npx expo start
```

You can then run the application using:

* Android Emulator
* Physical Android device
* Expo development environment

## 🔐 Authentication

Aora uses Appwrite for authentication.

The application also maintains authentication state locally so users can remain signed in between app sessions.

## ☁️ Appwrite

Appwrite is used as the backend service for Aora.

Current backend usage includes:

```text
Authentication
      ↓
Appwrite

Video Data
      ↓
Appwrite Database

Video / Media Files
      ↓
Appwrite Storage
```

## 🎨 UI

Aora uses **NativeWind** with Tailwind CSS for styling.

The application also supports theme-aware screens for both light and dark appearance.

## 📸 Screens

Add screenshots of your application here:

```text
screenshots/
├── get-started.png
├── login.png
├── home.png
├── search.png
├── create.png
├── bookmark.png
└── profile.png
```

Example:

![Aora Home Screen](screenshots/home.png)

## 🧪 Development

Check TypeScript:

```bash
npx tsc --noEmit
```

Check Expo project:

```bash
npx expo-doctor
```

Clear Metro cache:

```bash
npx expo start -c
```

## 🔮 Future Improvements

* Video upload optimization
* Video likes and comments
* Follow/unfollow creators
* Improved video recommendations
* Push notifications
* User profile editing
* Video categories
* More advanced search and filtering
* Improved media management

## 👨‍💻 Author

**Midhun G**

MERN Stack Developer | React Native Developer

GitHub: [MIDHUNcode](https://github.com/MIDHUNcode)

## 📄 License

This project is created for learning, development, and portfolio purposes.
