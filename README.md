## Introduction
This application is designed to shorten URLs and is developed as part of a take-home technical assessment. You can view a live version at [URL Shortener](https://url-shortener.varia.id.vn).
## Getting Started
### Prerequisites
- [Node.js](https://nodejs.org/)
- [MySQL](https://www.mysql.com/)
### Running the Project Locally
Follow the steps below to run both the client and API server on your local machine:
1. Clone the client and API server repositories:
```sh
git clone https://github.com/varia418/url-shortener-client.git
git clone https://github.com/varia418/url-shortener-api.git
```
2. Navigate to the API server folder and create a `.env` file based on the `.env.example` file:
```sh
cd url-shortener-api
cp .env.example .env
nano .env
# then fill the variable with your configuration details
```
3. Install dependencies and set up the database:
```sh
npm install
npm run db:generate
npm run db:migrate
```
4. Run the API server
```sh
npm run dev
```
5. Set up and serve the client:
```sh
# open a new terminal window
cd url-shortener-client
npm install
npm install -g serve
serve -s build
```
Your client should now be available at `http://localhost:3000` by default.
## Technology Stack
### Frontend
- **React:** Chosen for its rich ecosystem, developer-friendly tools, and the requirement of this assessment.
### Backend
- **Hono Framework:** A lightweight and fast web framework suitable for building small applications like this URL shortener.
### Database
- **MySQL:** Used for its familiarity and ease of integration.
## Completed features 
### Core requirements 
#### Frontend 
- [x] Implement a form to submit long URLs 
- [x] Display the generated short URL after submission 
- [x] Include a "Copy to Clipboard" button for the short URL 
- [x] Implement basic styling for a clean, responsive design 
#### Backend 
- [x] Create an API endpoint to receive long URLs and return shortened versions 
- [x] Implement a redirect service to handle requests for shortened URLs 
- [x] Generate unique short codes for each submitted URL 
- [x] Allow duplicate long URLs (each submission should create a new short URL) 
#### Database 
- [x] Store mappings between short codes and original URLs 
- [x] Save creation dates for each shortened URL 
#### Deployment 
- [x] Deploy the application to a publicly accessible platform 
- [x] Provide instructions for running the project locally 
### Nice-to-have features 
- [x] Password Protection: Allow users to set a password for accessing certain shortened URLs 
- [x] URL Expiry Date: Enable users to set an expiration date for shortened URLs 
- [x] Custom Short Codes: Allow users to specify their own custom short codes
## Future Improvements
- Implement URL banning to block malicious URLs.
- Add CAPTCHA verification to prevent bots from spamming.
- Track and analyze URL accesses, including:
    - Total clicks.
    - Clicks over time.
    - Clicks by geography, device language, device type, OS, and browser.
- Store user history of shortened URLs.
- Display the favicon of shortened URLs (using [icon.horse](https://icon.horse/icon/medium.com)).
- Allow bulk import of URLs via CSV.
- Implement URL expiration based on view count.
## Attributions
This project uses the following resources:
- [No cash icons](https://www.flaticon.com/free-icons/no-cash) created by alfanz - Flaticon.
- [Caps lock icons](https://www.flaticon.com/free-icons/caps-lock) created by Rahul Kaklotar - Flaticon.
- [Pencil icons](https://www.flaticon.com/free-icons/pencil) created by Sympnoiaicon - Flaticon.
- [Calendar icons](https://www.flaticon.com/free-icons/calendar) created by Septiana Faza - Flaticon.