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
}, { timestamps: true });

orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const lastOrder = await this.constructor.findOne({}, {}, { sort: { orderNumber: -1 } });
    this.orderNumber = lastOrder && lastOrder.orderNumber ? lastOrder.orderNumber + 1 : 1;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order; 