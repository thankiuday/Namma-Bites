import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    cuisine: {
        type: String,
        required: true,
        trim: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['Open', 'Closed'],
        default: 'Closed'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
vendorSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('Vendor', vendorSchema); 