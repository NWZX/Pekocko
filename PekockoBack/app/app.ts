import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

//
import * as userRoutes from './routes/userRoutes';
import * as sauceRoutes from './routes/sauceRoutes';

// Create a new express application instance
const app: express.Application = express();


//Connect to MongoDB
mongoose.connect('mongodb://mongo:27017/', { useNewUrlParser: true }).then(() => {
    console.log('Successfully connected to MongoDB');
}).catch((error) => {
    console.log('Unable to connect to MongoDB');
    console.error(error);
});

app.use(bodyParser.json())

//Create Route
app.use('/api/auth', userRoutes.default);
app.use('/api/sauces', sauceRoutes.default);

app.listen(3000, function () {
    console.log('SimpleChat API start on port 3000!');
})
export default app;