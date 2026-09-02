import mongoose, { Schema } from 'mongoose';


const ArtistInfoSchema = new Schema({
    artist : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
    bio : { type: String, required: true },
    schedTime : [{ type: String, required: true }],
    schedDay : [{ type: String, required: true }],
    profileImages : [{
        type : { type: String, required: true },
        fileUrl : String,
        fileType : String
    }],
    reviews : [{
        client : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
        comment : { type: String, required: true },
        img : { type: String, required: true },
        rating : { type: Number, required: true },
    }], 
});

export default mongoose.model('ArtistInfo', ArtistInfoSchema)