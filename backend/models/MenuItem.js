import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['veg', 'non-veg'],
  },
  image: {
    type: String, 
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Vendor',
  },
  vendorEmail: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem; 