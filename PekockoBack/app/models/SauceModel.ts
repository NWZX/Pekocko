import mongoose, { Schema, Document } from 'mongoose';

export interface ISauce extends Document {
    id: string;
    userId: string;
    name: string;
    manufacturer: string;
    description: string;
    mainPepper: string;
    imageUrl: string;
    heat: number;
    likes: number;
    dislikes: number;
    usersLiked: string[];
    usersDisliked: string[];
}

const sauceModel: Schema = new mongoose.Schema({
    id: { type: String, require: true },
    userId: { type: String, require: true },
    name: { type: String, require: true },
    manufacturer: { type: String, require: true },
    description: { type: String, require: true },
    mainPepper: { type: String, require: true },
    imageUrl: { type: String, require: true },
    heat: { type: Number, require: true },
    likes: { type: Number, require: true },
    dislikes: { type: Number, require: true },
    usersLiked: { type: Array, require: true },
    usersDisliked: { type: Array, require: true },
});

export default mongoose.model<ISauce>('Sauce', sauceModel);