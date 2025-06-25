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
  description: {
    type: String,
    default: '',
  },
  ingredients: [{
    type: String,
  }],
  allergens: [{
    type: String,
  }],
  preparationTime: {
    type: String,
    default: '',
  },
  calories: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    default: 0,
  },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    value: { type: Number, min: 1, max: 5 }
  }],
  ratingsSum: {
    type: Number,
    default: 0,
  },
  ratingsCount: {
    type: Number,
    default: 0,
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