import 'dotenv/config';

export default {
  expo: {
    name: 'NutriApp',
    slug: 'nutriapp',
    version: '1.0.0',
    scheme: 'nutriapp',
    icon: './assets/icon.png',
    web: {
      bundler: 'metro',
    },
    android: {
      package: 'com.khairuldanial.nutriapp',
      adaptiveIcon: {
        foregroundImage: './assets/icon.png',
        backgroundColor: '#1D9E75',
      },
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      eas: {
        projectId: 'b68200b0-7b32-457c-8dfd-1964fefe498d',
      },
    },
  },
};