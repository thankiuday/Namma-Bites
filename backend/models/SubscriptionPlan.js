import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  breakfast: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  lunch: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  dinner: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  snacks: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
}, { _id: false });

const subscriptionPlanSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  duration: { type: Number, enum: [7, 15, 30], required: true },
  price: { type: Number, required: true },
  weekMeals: {
    Monday: { type: mealSchema, required: true },
    Tuesday: { type: mealSchema, required: true },
    Wednesday: { type: mealSchema, required: true },
    Thursday: { type: mealSchema, required: true },
    Friday: { type: mealSchema, required: true },
    Saturday: { type: mealSchema, required: true },
    Sunday: { type: mealSchema, required: true },
  },
  planType: { type: String, enum: ['veg', 'non-veg'], required: true },
  mealTimings: {
    breakfast: { type: String, default: '8:00–10:00 AM' },
    lunch: { type: String, default: '11:00 AM–3:00 PM' },
    snacks: { type: String, default: '4:00–6:00 PM' },
    dinner: { type: String, default: '7:00–10:00 PM' },
  },
}, { timestamps: true });

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);

export default SubscriptionPlan; 