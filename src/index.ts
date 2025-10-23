import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import connectDB from './config/database';
import router from './router';
import UtilServices from './services/utilService';

const app: Express = express();

connectDB();
app.use(cors());
// Allow up to 25MB for JSON and URL-encoded requests
app.use(express.json({ limit: "25mb" }));

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({message: 'Welcome to LGA Certificate Server'});
});

app.use('/api/v1', router);

app.use((req: Request, res: Response) => {
    res.status(404).json({message: 'NOT FOUND'});
});

const port: number = Number(process.env.PORT);

(async () => {
    try {
        await UtilServices.superSignup();
        app.listen(port, () => console.log(`Server running on port ${port}`));
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
})();