import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['subscription_alert', 'special_offer', 'system', 'order_update'],
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel',
    required: true
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['Vendor', 'Admin']
  },
  recipients: {
    type: String,
    enum: ['all_users', 'subscribed_users', 'user'],
    required: true
  },
  recipientUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.recipients === 'user';
    }
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: function() {
      return this.type === 'subscription_alert';
    }
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Optional order linkage for order updates
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  linkPath: {
    type: String
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Index for efficient querying
notificationSchema.index({ type: 1, isActive: 1, validFrom: 1, validUntil: 1 });
notificationSchema.index({ 'readBy.user': 1 });
// TTL index: automatically delete documents after validUntil passes
// Note: MongoDB TTL runs ~every 60 seconds and only affects docs with validUntil set
notificationSchema.index({ validUntil: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
