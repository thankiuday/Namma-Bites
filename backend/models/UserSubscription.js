import mongoose from 'mongoose';

const userSubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscriptionPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  startDate: { type: Date, required: true },
  duration: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired', 'cancelled'],
    default: 'pending'
  },
  paymentProof: { type: String }, // file path or URL
  validated: { type: Boolean, default: false }, // new field for QR validation
  prebookings: [
    {
      date: { type: String, required: true }, // YYYY-MM-DD
      mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snacks'], required: true },
      status: { type: String, enum: ['booked', 'cancelled'], default: 'booked' }
    }
  ],
  cancelledAt: { type: Date }, // timestamp when subscription was cancelled
  cancellationReason: { type: String }, // optional reason for cancellation
}, { timestamps: true });

const UserSubscription = mongoose.model('UserSubscription', userSubscriptionSchema);

export default UserSubscription; 