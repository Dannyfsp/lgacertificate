import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import connectDB from './config/database';
import router from './router';

const app: Express = express();

async function startServer() {
    try {
        // ✅ Wait for DB connection and stop if it fails
        await connectDB();

        app.use(cors());
        app.use(express.json({ limit: "25mb" }));

        app.get('/', (req: Request, res: Response) => {
            res.status(200).json({ message: 'Welcome to LGA Certificate Server' });
        });

        app.use('/api/v1', router);

        app.use((req: Request, res: Response) => {
            res.status(404).json({ message: 'NOT FOUND' });
        });

        const port: number = Number(process.env.PORT);
        app.listen(port, () =>
            console.log(`🚀 Server running on port ${port}`)
        );

    } catch (error) {
        console.error("❌ Failed to connect to MongoDB, server NOT started");
        console.error(error);
        process.exit(1); // ✅ Immediately terminate app
    }
}

startServer();
