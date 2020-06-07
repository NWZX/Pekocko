//Required dependency
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

//Route Files
import * as userRoutes from './routes/userRoutes';
import * as sauceRoutes from './routes/sauceRoutes';
import { ErrorHandler, handleError, isErrorHandler } from './security/errorModule';

//Setting
import { PORT, IMG_PATH } from './appSettings';

// Create a new express application instance
const app: express.Application = express();


//Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/', { useNewUrlParser: true }).then(() => {
    console.log('Successfully connected to MongoDB');
}).catch((error) => {
    console.log('Unable to connect to MongoDB');
    console.error(error);
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.json());

//Create Route
app.use('/public/blob/', express.static(IMG_PATH()));
app.use('/api/auth', userRoutes.default);
app.use('/api/sauces', sauceRoutes.default);
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (isErrorHandler(err))
        handleError(err, res);
    else if (err instanceof Error)
        handleError(new ErrorHandler(500, '( ' + err.name + ' ) :' + err.message), res);
    else
        handleError(new ErrorHandler(500, JSON.stringify(err)), res);
});

app.listen(PORT, function () {
    console.log('SimpleChat API start on port ' + PORT);
});