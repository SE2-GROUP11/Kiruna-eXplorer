/*** Importing modules ***/
import express from 'express';
import morgan from 'morgan';
import cors from 'cors'

/*** init express and set up the middlewares ***/
const app = express();
app.use(morgan('dev'));
app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200,
    credentials: true
};
app.use(cors(corsOptions))


const PORT = 3001;

// Activating the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));