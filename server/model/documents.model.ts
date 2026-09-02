import mongoose, { Schema } from 'mongoose';

const PermitSchema = new Schema(
  {
    url: { type: String, required: true },
    expiration: { type: String, required: true },
  },
  { _id: false }
);

const DocumentsSchema = new Schema({
  bussiness: { type: mongoose.Schema.Types.ObjectId, ref: "Accounts", required: true },

  bussinessPermit: { type: PermitSchema, default: null },
  BarangayClearance: { type: PermitSchema, default: null },
  MayorPermit: { type: PermitSchema, default: null },
  sanitaryPermit: { type: PermitSchema, default: null },
  HealthPermit: { type: PermitSchema, default: null },

  BIRRegistarion: {
    type: new Schema({ url: { type: String, required: true } }, { _id: false }),
    default: null,
  },

  DTIRegistarion: {
    type: new Schema({ url: { type: String, required: true } }, { _id: false }),
    default: null,
  },

  SECRegistarion: {
    type: new Schema({ url: { type: String, required: true } }, { _id: false }),
    default: null,
  },
});

export default mongoose.model('Documentss', DocumentsSchema)