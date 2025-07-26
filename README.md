# Career Navigator

A full-stack web application that assists students in identifying the most suitable career paths based on their personal interests and academic preferences.

## Features

- Dynamic quiz system evaluating student interests and subject choices
- Personalized career recommendations from a structured career database
- User authentication
- Career search and filter system
- Personalized dashboard to save and track recommendations
- Informative roadmaps for each suggested career path

## Tech Stack

- MongoDB: Database
- Express.js: Backend framework
- React.js: Frontend library
- Node.js: Runtime environment

## Project Structure

```
├── client/             # React frontend
├── server/             # Node.js & Express backend
├── package.json        # Project configuration
└── README.md           # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies for both client and server
3. Set up environment variables
4. Run the development server

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Run both client and server concurrently (from root directory)
cd ..
npm run dev
```

## License

MIT