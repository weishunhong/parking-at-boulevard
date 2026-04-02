import mongoose, { Schema, type InferSchemaType } from "mongoose";

const registrationEventSchema = new Schema(
  {
    createdAt: { type: Date, required: true, default: () => new Date() },
    status: { type: String, required: true, enum: ["success", "failure"] },
    durationHours: { type: Number, required: true },
    message: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, required: false },
    trigger: {
      type: String,
      required: true,
      enum: ["cron", "manual"],
    },
  },
  { collection: "registration_events" },
);

export type RegistrationEventDoc = InferSchemaType<
  typeof registrationEventSchema
> & { _id: mongoose.Types.ObjectId };

export const RegistrationEvent =
  mongoose.models.RegistrationEvent ??
  mongoose.model("RegistrationEvent", registrationEventSchema);
