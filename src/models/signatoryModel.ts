import mongoose, { Schema, Document } from "mongoose";

export interface ISignatory extends Document {
  lga: string;
  chairmanName: string | null | undefined;
  secretaryName: string | null | undefined;
  chairmanSignature: string;
  secretarySignature: string;
}

const signatorySchema = new Schema<ISignatory>(
  {
    lga: { type: String, required: true },
    chairmanName: { type: String, required: true },
    secretaryName: { type: String, required: true },
    chairmanSignature: { type: String, required: true },
    secretarySignature: { type: String, required: true },
  },
  { timestamps: true }
);

const Signatory = mongoose.model<ISignatory>("Signatory", signatorySchema);
export default Signatory;
