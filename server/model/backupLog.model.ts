import mongoose, { Schema } from 'mongoose';

const BackupLogSchema = new Schema({
    createdBy : { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },
    createdAt : { type: Date, required: true },
    collections : [{ type: String, required: true }],
});

export default mongoose.model('BackupLog', BackupLogSchema)
