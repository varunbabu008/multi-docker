# Multi-Docker Application

A modern multi-container Docker application featuring a React frontend, Express.js backend, Redis worker, PostgreSQL database, and Nginx reverse proxy.

## Architecture

- **Frontend**: React 18 with React Router v6
- **Backend**: Express.js with modern Redis v4 client
- **Worker**: Redis-based background job processor
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Reverse Proxy**: Nginx

## Features

- Fibonacci calculator with background processing
- Real-time updates via Redis pub/sub
- Persistent data storage in PostgreSQL
- Modern React hooks and functional components
- Docker containerization for all services

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd multi-docker
```

2. Start all services:
```bash
docker-compose up --build
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Nginx Proxy: http://localhost:3050

## Services

### Frontend (React)
- Port: 3000
- Features: Modern React with hooks, React Router v6
- Hot reloading enabled in development

### Backend (Express.js)
- Port: 5000
- Features: RESTful API, PostgreSQL integration, Redis pub/sub
- Endpoints:
  - `GET /` - Health check
  - `GET /values/all` - Get all calculated values
  - `GET /values/current` - Get current Redis values
  - `POST /values` - Submit new index for calculation

### Worker
- Background service for Fibonacci calculations
- Listens to Redis pub/sub for new calculation requests
- Updates Redis with calculated results

### Database (PostgreSQL)
- Port: 5432
- Stores calculated Fibonacci indices
- Persistent data storage

### Cache (Redis)
- Port: 6379
- Stores current calculation results
- Handles pub/sub messaging

### Nginx
- Port: 3050
- Reverse proxy for load balancing
- Serves static files

## Development

### Running in Development Mode
```bash
docker-compose up --build
```

### Running in Production Mode
```bash
docker-compose -f docker-compose.prod.yml up --build
```

### Stopping Services
```bash
docker-compose down
```

### Viewing Logs
```bash
docker-compose logs -f [service-name]
```

## API Usage

### Calculate Fibonacci Number
```bash
curl -X POST http://localhost:5000/values \
  -H "Content-Type: application/json" \
  -d '{"index": 10}'
```

### Get All Calculated Values
```bash
curl http://localhost:5000/values/all
```

### Get Current Redis Values
```bash
curl http://localhost:5000/values/current
```

## Technology Stack

### Frontend
- React 18.2.0
- React Router 6.8.0
- Axios 1.3.0

### Backend
- Express.js 4.18.2
- Redis 4.6.7
- PostgreSQL 8.10.0
- CORS 2.8.5

### Infrastructure
- Docker 20+
- Docker Compose 3.8
- Node.js 18 (Alpine)
- PostgreSQL 15 (Alpine)
- Redis 7 (Alpine)
- Nginx

## Recent Updates

- Updated all dependencies to latest stable versions
- Migrated from React class components to functional components with hooks
- Updated React Router from v4 to v6
- Modernized Redis client usage (v4 with async/await)
- Improved error handling throughout the application
- Added proper Docker Compose dependencies
- Enhanced development experience with better logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License 