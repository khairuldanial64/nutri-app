# NutriApp - AI Macro Tracker
Hello! it is just a personal passion project of mine. Since I'm into fitness, I have always wanted an easier way to measure my calorie and protein intake. Manually typing into ChatGPT my meals and logging them on my notepad app is a hassle and other 3rd party apps out there on the appstore are too tedious and would always require a subscription to use. Hence this is where I got the idea to make my own app for my own personal use. You can use it as well as long as you have your own OpenAI api key and deploy your own Vercel backend! Happy using!
A cross-platform mobile nutrition tracking app built with React Native and Expo.

## Features
- AI-powered macro extraction from natural language meal descriptions using OpenAI GPT-4o Mini
- Daily and weekly macro tracking with progress visualisation
- On-device meal history stored with SQLite
- Serverless backend on Vercel for secure API key management

## Tech Stack
- React Native + Expo
- expo-sqlite for on-device storage
- OpenAI GPT-4o Mini API
- Vercel serverless backend
- EAS Build for APK generation

## Setup
1. Clone the repo
2. Run `npm install`
3. Create a `.env` file in the root with:
   EXPO_PUBLIC_API_URL=your_vercel_url_here
4. Deploy your own Vercel backend from `/backend`
5. Run `npx expo start`
