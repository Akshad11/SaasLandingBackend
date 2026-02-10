
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

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
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
    app.use('/api/users', require('./routes/user.routes')); // New
    app.use('/api/contact', require('./routes/contact.routes'));
    app.use('/api/upload', require('./routes/upload.routes'));
    app.use('/api/jobs', require('./routes/job.routes'));
    app.use('/api/cms', require('./routes/cms.routes'));
    app.use('/api/admin', require('./routes/admin.routes')); // New Admin Routes

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

    // Start Server
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`GraphQL ready at http://localhost:${PORT}/graphql`);
    });
}

startServer();
