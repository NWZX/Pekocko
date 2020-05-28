import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    userId: string;
    email: string;
    password: string;
}

const userModel: Schema = new mongoose.Schema({
    userId: { type: String, require: true },
    email: { type: String, require: true },
    password: { type: String, require: true }
});

export default mongoose.model<IUser>('User', userModel);