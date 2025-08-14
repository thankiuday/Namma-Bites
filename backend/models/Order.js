import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  picture: { type: String },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  items: { type: [orderItemSchema], required: true },
  paymentProof: { type: String }, // file path or URL
  state: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'completed', 'rejected'],
    default: 'pending'
  },
  qrCode: { type: String }, // generated after vendor accepts
  orderNumber: { type: Number, unique: true, index: true },
  estimatedPreparationTime: { type: Number }, // in minutes
  actualPreparationTime: { type: Number }, // in minutes
  stateTimestamps: {
    pending: { type: Date, default: Date.now },
    preparing: Date,
    ready: Date,
    completed: Date,
    rejected: Date
  }
}, { timestamps: true });

// Calculate actual preparation time when order is completed
orderSchema.pre('save', function(next) {
  if (this.isModified('state')) {
    // Update state timestamp
    this.stateTimestamps[this.state] = new Date();
    
    // Calculate actual preparation time when order is completed or ready
    if ((this.state === 'completed' || this.state === 'ready') && this.stateTimestamps.preparing) {
      const prepStartTime = new Date(this.stateTimestamps.preparing);
      const prepEndTime = new Date(this.stateTimestamps[this.state]);
      this.actualPreparationTime = Math.round((prepEndTime - prepStartTime) / (1000 * 60)); // Convert to minutes
    }
  }
  next();
});

orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const lastOrder = await this.constructor.findOne({}, {}, { sort: { orderNumber: -1 } });
    this.orderNumber = lastOrder && lastOrder.orderNumber ? lastOrder.orderNumber + 1 : 1;
  }
  next();
});

// Helpful indexes for performance at scale (ensure defined before model compile)
orderSchema.index({ vendor: 1, createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ state: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;