# News Reader Application

A modern news reading application built with React, Vite, and Express.

## Features

- **Featured Article View**: Flipboard-style single article navigation.
- **Categories & Search**: Filter news by topic or keyword.
- **Favorites**: Save articles for later reading.
- **Responsive**: Works on Desktop and Mobile.
- **Secure**: API Key is hidden behind a backend proxy.

## Setup

1. **Install Dependencies**

   ```bash
   npm run server:install
   npm run web:install
   # OR
   npm run install:all
   ```

2. **Configure Environment**

   - Navigate to `/server`
   - Create a `.env` file (copy from `.env.example`)
   - Add your `THENEWSAPI_TOKEN`.

   ```
   THENEWSAPI_TOKEN=your_api_token_here
   ```

3. **Run the App**
   To run both client and server:

   ```bash
   npm run dev
   ```

   - **Web**: http://localhost:5176
   - **Server**: http://localhost:5177

## Architecture

- **Web**: React + Vite + TypeScript. Located in `/web`.
- **Server**: Express. Located in `/server`. Proxies requests to `api.thenewsapi.com`.
