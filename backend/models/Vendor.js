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
    status: {
        type: String,
        enum: ['Open', 'Closed'],
        default: 'Closed'
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    establishedDate: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Vendor', vendorSchema); 