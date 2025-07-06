import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  role: { type: String, enum: ['faculty', 'guest', 'student'], default: 'student' },
  isActive: { type: Boolean, default: true },
  cart: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    quantity: { type: Number, required: true, min: 1 }
  }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  console.log('Pre-save middleware triggered');
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    name: this.name,
    mobileNumber: this.mobileNumber,
    role: this.role,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema); 