//Required dependency
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

//Route Files
import * as userRoutes from './routes/userRoutes';
import * as sauceRoutes from './routes/sauceRoutes';
import { ErrorHandler, handleError, isErrorHandler } from './security/errorModule';

//Setting
import { PORT, IMG_PATH, MONGO_DB_URL } from './appSettings';

// Create a new express application instance
const app: express.Application = express();

//Connect to MongoDB
mongoose.connect(MONGO_DB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('Successfully connected to MongoDB');
}).catch((error) => {
    console.log('Unable to connect to MongoDB');
    console.error(error);
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

//Helmet http header security
app.use(helmet());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", 'fonts.googleapis.com', 'use.fontawesome.com']
    }
}))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Protect for noSQL injection
app.use(mongoSanitize())

//Create Route
app.use('/public/blob/', express.static(IMG_PATH()));
app.use('/api/auth', userRoutes.default);
app.use('/api/sauces', sauceRoutes.default);
app.use((err: unknown, req: express.Request, res: express.Response) => {
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