
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

console.log('Current CWD:', process.cwd());
console.log('JWT_SECRET Loaded:', !!process.env.JWT_SECRET);
if (!process.env.JWT_SECRET) console.error('FATAL: JWT_SECRET is missing!');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - Allow multiple origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://aarvionservices.com',
    process.env.CLIENT_URL
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or same-origin)
        if (!origin) return callback(null, true);

        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Allow any Vercel preview URLs for aarvionservices
        if (origin.includes('aarvionservices') && origin.includes('vercel.app')) {
            return callback(null, true);
        }

        // Reject other origins
        const msg = `The CORS policy for this site does not allow access from origin ${origin}`;
        return callback(new Error(msg), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 hours
}));
app.use(express.json());

const analyticsRoutes = require('./routes/analyticsRoutes');
app.use('/api/analytics', analyticsRoutes);

// Database Connection
connectDB();

// Apollo Server Setup
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const context = require('./graphql/context');

async function startServer() {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: true, // Enable for development
    });

    await server.start();

    app.use(
        '/graphql',
        cors(),
        express.json(),
        expressMiddleware(server, {
            context: context,
        })
    );

    // REST Routes
    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/users', require('./routes/user.routes'));
    app.use('/api/contact', require('./routes/contact.routes'));
    app.use('/api/upload', require('./routes/upload.routes'));
    app.use('/api/jobs', require('./routes/job.routes'));
    app.use('/api/cms', require('./routes/cms.routes'));
    app.use('/api/admin', require('./routes/admin.routes'));

    // Health Check Route
    app.get('/api/health', (req, res) => {
        res.send('Aarvionservices API is running...');
    });

    // Error Handling Middleware
    app.use((err, req, res, next) => {
        console.error('Unhandled Error:', err.stack);
        res.status(500).json({
            message: err.message,
            stack: process.env.NODE_ENV === 'production' ? null : err.stack
        });
    });

    // Only start HTTP server if not in serverless environment
    if (!process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.VERCEL && !process.env.NETLIFY) {
        // Start Server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`GraphQL ready at http://localhost:${PORT}/graphql`);
        });
    }

    return app;
}

// Initialize server
let serverPromise;
if (require.main === module) {
    // Running directly (local development)
    serverPromise = startServer().catch(err => {
        console.error('Failed to start server:', err);
        process.exit(1);
    });
} else {
    // Being imported (serverless)
    serverPromise = startServer();
}

// Export for serverless environments
module.exports = app;
module.exports.handler = async (event, context) => {
    await serverPromise; // Ensure server is initialized
    const serverless = require('serverless-http');
    return serverless(app)(event, context);
};

