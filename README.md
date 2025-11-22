# File Auth Management API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  A robust, production-ready NestJS application for file management with JWT authentication and role-based access control (RBAC).
</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen" alt="Node Version" />
  <img src="https://img.shields.io/badge/typescript-%3E%3D5.0.0-blue" alt="TypeScript Version" />
</p>

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Authentication](#-authentication)
- [File Upload](#-file-upload)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- 🔐 **JWT Authentication** - Secure token-based authentication with access and refresh tokens
- 👥 **Role-Based Access Control (RBAC)** - Admin and User roles with granular permissions
- 📁 **File Management** - Upload, retrieve, update, and delete files with Cloudinary integration
- 🔄 **Refresh Token Rotation** - Secure token refresh mechanism
- 🛡️ **Rate Limiting** - Protection against brute force attacks
- 💾 **Caching** - Optimized performance with in-memory caching
- 📊 **Health Checks** - Application and database health monitoring
- 📝 **API Documentation** - Interactive Swagger/OpenAPI documentation
- ✅ **File Validation** - Size and type restrictions for secure uploads
- 🔍 **Advanced Search** - Pagination, filtering, and sorting for user management
- 📝 **Request Validation** - Comprehensive input validation using class-validator
- 🗄️ **Database Transactions** - ACID-compliant database operations

## 🛠 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) v11.0.1
- **Language**: TypeScript 5.7.3
- **Database**: MySQL with TypeORM 0.3.27
- **Authentication**: JWT with Argon2 password hashing
- **File Storage**: Cloudinary
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer
- **Caching**: @nestjs/cache-manager
- **Rate Limiting**: @nestjs/throttler

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **MySQL** (v8.0 or higher)
- **Cloudinary Account** (for file storage)

## 🚀 Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd file-auth-management
```

2. **Install dependencies**

```bash
yarn install
# or
npm install
```

3. **Set up environment variables**

Copy the `.env.example` file to `.env` and fill in your configuration:

```bash
cp .env.example .env
```

4. **Configure your database**

Create a MySQL database and update the connection details in your `.env` file.

5. **Set up Cloudinary**

Create a Cloudinary account at [cloudinary.com](https://cloudinary.com) and add your credentials to `.env`.

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000

# Environment
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password_here
DB_NAME=file_auth_management

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=15m
REFRESH_JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB in bytes

# Cloudinary Configuration
CLOUD_NAME=your_cloud_name
API_KEY=your_api_key
API_SECRET=your_api_secret
```

> **Note**: Generate a strong JWT secret using: `openssl rand -base64 32`

## 🏃 Running the Application

### Development Mode

```bash
# Start in watch mode (auto-reload on changes)
yarn start:dev

# or
npm run start:dev
```

The application will be available at `http://localhost:3000`

### Production Mode

```bash
# Build the application
yarn build

# Start in production mode
yarn start:prod

# or
npm run build
npm run start:prod
```

### Debug Mode

```bash
yarn start:debug
```

## 📚 API Documentation

Once the application is running, access the interactive API documentation:

- **Swagger UI**: `http://localhost:3000/api`
- **Health Check**: `http://localhost:3000/health`

The Swagger UI provides:

- Complete API endpoint documentation
- Request/response schemas
- Try-it-out functionality
- Authentication support (JWT Bearer token)

## 📁 Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── decorator/       # Custom decorators (Roles)
│   ├── dto/             # Data Transfer Objects
│   ├── guard/           # JWT & Roles guards
│   └── interface/       # JWT payload interface
├── user/                # User management
│   ├── dto/             # User DTOs
│   ├── entity/          # User entity
│   └── enum/            # User roles enum
├── file/                # File management
│   ├── cloudinary/      # Cloudinary integration
│   ├── dto/             # File DTOs
│   ├── entities/        # File entity
│   └── pipes/           # File validation pipes
├── token/               # Refresh token management
│   ├── dto/             # Token DTOs
│   └── entity/          # Token entity
├── health/              # Health check endpoints
├── database/            # Database configuration
└── common/              # Shared utilities
    ├── dto/             # Common DTOs
    ├── interceptors/   # Logging interceptor
    ├── interfaces/      # Common interfaces
    └── middleware/      # Logger middleware
```

## 🔐 Authentication

### Registration

```bash
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "StrongP@ssw0rd123!",
  "role": "user"  # Optional, defaults to "user"
}
```

### Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "StrongP@ssw0rd123!"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Using the Access Token

Include the access token in the Authorization header:

```bash
Authorization: Bearer <access_token>
```

### Refresh Token

```bash
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Profile

```bash
GET /auth/profile
Authorization: Bearer <access_token>
```

## 📤 File Upload

### Upload a File

```bash
POST /files/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: <file>
filename: "my-document.pdf"
folder: "nestjs-uploads"  # Optional
```

### File Upload Restrictions

- **Maximum Size**: 10MB (configurable via `MAX_FILE_SIZE`)
- **Allowed Types**:
  - **Images**: jpg, jpeg, png, gif, webp, svg
  - **Documents**: pdf, doc, docx, xls, xlsx, ppt, ppttx, txt, csv
  - **Archives**: zip, rar
  - **Videos**: mp4, mpeg, mov
  - **Audio**: mp3, wav

### Get File by ID

```bash
GET /files/:id
Authorization: Bearer <access_token>
```

### Update File Metadata

```bash
PATCH /files/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "filename": "updated-name.pdf",
  "folder": "new-folder"  # Optional
}
```

### Delete File (Admin Only)

```bash
DELETE /files/:id
Authorization: Bearer <access_token>
```

## 🧪 Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov

# Watch mode
yarn test:watch
```

## 🚢 Deployment

### Production Checklist

1. **Environment Variables**: Ensure all production environment variables are set
2. **Database**: Set `NODE_ENV=production` to disable auto-synchronization
3. **JWT Secret**: Use a strong, randomly generated secret
4. **HTTPS**: Enable HTTPS in production
5. **Rate Limiting**: Adjust rate limits based on your needs
6. **File Size Limits**: Configure appropriate file size limits
7. **Database Backups**: Set up regular database backups
8. **Monitoring**: Implement application monitoring and logging

### Build for Production

```bash
# Build the application
yarn build

# The dist/ folder will contain the compiled JavaScript
```

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN yarn install --production

COPY . .
RUN yarn build

EXPOSE 3000

CMD ["node", "dist/main"]
```

## 📊 API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/register-admin` - Register admin (Admin only)
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile (Protected)
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

### Users

- `GET /users` - List users with pagination (Admin only)

### Files

- `POST /files/upload` - Upload file (Protected)
- `GET /files` - List all files (Admin only)
- `GET /files/:id` - Get file by ID (Owner only)
- `PATCH /files/:id` - Update file metadata (Owner only)
- `DELETE /files/:id` - Delete file (Admin only)

### Health

- `GET /health` - Health check endpoint

## 🔒 Security Features

- **Password Hashing**: Argon2 algorithm for secure password storage
- **JWT Tokens**: Secure token-based authentication
- **Refresh Token Rotation**: Enhanced security with token rotation
- **Rate Limiting**: Protection against brute force attacks (5 requests/minute)
- **Input Validation**: Comprehensive validation using class-validator
- **File Type Validation**: MIME type and extension validation
- **File Size Limits**: Configurable file size restrictions
- **Role-Based Access Control**: Granular permission system
- **SQL Injection Protection**: TypeORM parameterized queries
- **CORS**: Configurable Cross-Origin Resource Sharing

## 🐛 Troubleshooting

### Database Connection Issues

- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists
- Check network connectivity

### File Upload Issues

- Verify Cloudinary credentials
- Check file size limits
- Ensure file type is allowed
- Verify JWT token is valid

### Authentication Issues

- Verify JWT_SECRET is set
- Check token expiration settings
- Ensure refresh token is valid
- Verify user exists in database

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features

## 📝 License

This project is [UNLICENSED](LICENSE).

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [TypeORM](https://typeorm.io/) - ORM for TypeScript and JavaScript
- [Cloudinary](https://cloudinary.com/) - Cloud-based image and video management
- [Swagger](https://swagger.io/) - API documentation framework

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

<p align="center">Made with ❤️ using NestJS</p>
