# 📧 Kmail - Your Personal Email Client

**Kmail** is a full-fledged email application inspired by Gmail, powered by the Gmail API. It allows users to perform all core email functions (view, compose, send, delete emails, etc.), and includes features like AI-generated emails and Google authentication. 

This project is built using the latest technologies, including Google OAuth for authentication, the Gmail API for email functionalities, AI-powered mail generation using OpenAI's API, and Shadcn components with multiple color themes.

---

## 🌟 Features

- 📥 **View Emails**: Check received and sent emails directly within the app.
- ✉️ **Compose & Send**: Easily compose and send emails to any email address.
- 🤖 **AI Mail Composer**: Generate emails with AI based on prompts, powered by Google Gemini.
- 🏳️‍🌈 **Multiple Color Themes**: Customize your email experience with various Shadcn-based color themes.
- 🔒 **Google Authentication**: Log in using your Google account with OAuth 2.0.
- 🎨 **Interactive User Interface**: Beautiful, responsive UI built with Shadcn components.
- 🖼️ **Screenshot Support**: Capture the app UI and features for your documentation and walkthroughs.

---

## 🖥️ Tech Stack

- **Frontend**: React, Shadcn UI, TailwindCSS, Axios
- **Backend**: Node.js, Express, MongoDB
- **APIs**: Gmail API, Gemini API, Google OAuth 2.0

---

## 🚀 Getting Started

### 📦 Prerequisites

Ensure that you have the following installed on your machine:

- Node.js (v14+)
- MongoDB (v4.4+)
- A Google Cloud account with Gmail API enabled
- Gemini API key

### ⚙️ Installation

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/kmail.git
    cd kmail
    ```

2. **Install Dependencies**:
    ```bash
    npm install
    ```

3. **⚙️ Environment Variables

In order to make Kmail run smoothly, ensure you have the following environment variables set:

    Create a `.env` file at the root of your project with the following content:

    ```bash
    # Frontend .env Variables
    
    REACT_APP_CLIENT_ID=your_google_oauth_client_id

    # Backend .env Variables
    
    PORT=8000
    CLIENT_ID=your_google_oauth_client_id 
    CLIENT_SECRET=your_google_oauth_client_secret
    REDIRECT_URI=http://localhost:3000
    GOOGLE_API_KEY=your_google_api_key
    MONGO_URI=your_mongo_uri
    ```

4. **Run the App**:
    - Run the backend:
    ```bash
    npm run server
    ```
    - Run the frontend:
    ```bash
    npm start
    ```

### 🔑 Google Authentication Setup

To enable Google OAuth login, you'll need to:

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project and enable **Gmail API**.
3. Create OAuth 2.0 credentials and get your `CLIENT_ID` and `CLIENT_SECRET`.
4. Add your redirect URIs (`http://localhost:3000` for development).

---

## 📚 API Endpoints

### Authentication ### Email ### AI-Powered Email

- **POST /api/v1/emails**: Handles Google OAuth login.
- **GET /api/v1/emails **: Gets authenticated user details.

---

## 🎨 Theming with Shadcn

Kmail comes with multiple theme options built with Shadcn. Users can switch between themes in real-time to enhance their email experience.

### Adding New Themes

To add a new theme, update the `themes.config.js` file and adjust the CSS variables accordingly.

---

## 🖼️ Screenshots

Below are some screenshots of the Kmail app in action:

### 1. **Login Screen**
![Login Screen](https://drive.google.com/uc?export=view&id=1ZYZaRQHpF-V3QrR-bW_IzAyVYgCj0dBm)

### 2. **Inbox View**
![Inbox View](https://drive.google.com/uc?export=view&id=1iySFBcY4isTtj9z1xSOxFzFf7dh2SOZT)

### 3. **Compose Email**
![Compose Email](https://drive.google.com/uc?export=view&id=1ZYZaRQHpF-V3QrR-bW_IzAyVYgCj0dBm)

---



