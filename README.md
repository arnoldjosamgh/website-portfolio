# LuxeCurve Portfolio Website

A modern, responsive e-commerce website for a premium fashion brand. Built with HTML, CSS, JavaScript (Frontend) and Node.js (Backend).

## Features
- **Responsive Design**: Works on Desktop, Tablet, and Mobile.
- **User Accounts**: Registration and Login functionality.
- **Shopping Cart**: Add items, view cart, and checkout.
- **Admin Dashboard**: View registered users and stats.
- **Secure**: Basic authentication and session management.

## Project Structure
- `index.html`: Main landing page and shop interface.
- `admin.html`: Admin dashboard.
- `server.js`: Node.js backend server (handling API and static files).
- `css/`: Stylesheets.
- `js/`: Frontend logic (`app.js`).
- `resources/`: Images and assets.
- `database/`: Simple file-based storage for users and inventory (CSV).

## Local Setup

1.  **Install Node.js**: Download and install from [nodejs.org](https://nodejs.org/).
2.  **Open Terminal**: Navigate to this project folder.
3.  **Install Dependencies**:
    ```bash
    npm install
    ```
    *(Note: No external dependencies are currently strictly required for the core server as it uses native modules, but `package.json` is included for hosting compatibility).*
4.  **Run Server**:
    ```bash
    node server.js
    ```
5.  **View Website**: Open `http://localhost:3000` in your browser.

## Hosting (Render)

This project is configured for free hosting on [Render](https://render.com).

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/arnoldjosamgh/website-portfolio)

1.  Click the button above.
2.  Sign in with GitHub.
3.  Click "Create Web Service".

## Admin Access
- **URL**: `/admin.html`
- **Credential Requirement**: You must be logged in as `admin@luxecurve.com`.

## License
Private Portfolio Project.
