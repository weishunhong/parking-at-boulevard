import mongoose, { Schema, type InferSchemaType } from "mongoose";

const scheduleStateSchema = new Schema(
  {
    /** LA calendar date YYYY-MM-DD */
    laDate: { type: String, required: true, unique: true, index: true },
    /** Minute within the target LA hour (0–59). */
    targetMinute: { type: Number, required: true, min: 0, max: 59 },
    /** LA wall hour (0–23) when the schedule row was first created (e.g. 0 = midnight hour). */
    targetHourLa: { type: Number, required: false, min: 0, max: 23 },
    /** When the automatic run finished (success or failure). */
    autoRunCompletedAt: { type: Date, required: false, default: null },
    /** In-flight lock to avoid duplicate concurrent cron runs. */
    processing: { type: Boolean, required: false, default: false },
  },
  { collection: "schedule_state" },
);

export type ScheduleStateDoc = InferSchemaType<typeof scheduleStateSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ScheduleState =
  mongoose.models.ScheduleState ??
  mongoose.model("ScheduleState", scheduleStateSchema);
