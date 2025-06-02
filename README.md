# CampusCodeWars

A competitive coding platform for campus events built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- User authentication and authorization
- Code editor with Monaco Editor
- Problem management
- Contest creation and management
- Code submission and evaluation
- Real-time updates
- Role-based access control

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Monaco Editor
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Code Editor**: Monaco Editor

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/CampusCodeWars.git
   cd CampusCodeWars
   ```

2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Set up environment variables:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

4. Start the development servers:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure

```
CampusCodeWars/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/         # Page components
│       ├── context/       # React context
│       ├── hooks/         # Custom hooks
│       └── utils/         # Utility functions
├── server/                # Express backend
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Custom middleware
│   │   ├── models/       # Mongoose models
│   │   └── routes/       # API routes
│   └── .env              # Environment variables
└── package.json          # Root package.json
```

## Environment Variables

Check `.env.example` files in both client and server directories for required environment variables.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the ISC License. 