import mongoose, { Schema } from 'mongoose';


const ArtistApplicationSchema = new Schema({
    artist : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
    bussiness : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
    date :  { type: String, required: true },
    time : { type: String, required: true }
});

export default mongoose.model('ArtistApplication', ArtistApplicationSchema)