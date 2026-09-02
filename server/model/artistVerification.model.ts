import mongoose, { Schema } from 'mongoose';


const ArtistVerificationSchema = new Schema({
    client : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
    validId :  { type: String, required: true },
    type : { type: String, required: true },
    bussinessPermit : String,
    barangayClearance : String,
    permitExpiration : String,
    clearanceExpiration : String,
    bussinessName : String,
});

export default mongoose.model('ArtistVerification', ArtistVerificationSchema)