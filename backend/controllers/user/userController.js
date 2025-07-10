import User from '../../models/User.js';
import SubscriptionPlan from '../../models/SubscriptionPlan.js';
import UserSubscription from '../../models/UserSubscription.js';
import jwt from 'jsonwebtoken';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.admin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Delete user by ID (admin only)
export const deleteUser = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }
    res.status(200).json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// Update user by ID (admin only)
export const updateUser = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    const updateFields = { ...req.body };
    // Prevent updating password or _id via this route
    delete updateFields.password;
    delete updateFields._id;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }
    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: user
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Get current user's profile
export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
};

// Update current user's profile
export const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const updateFields = { ...req.body };
    delete updateFields.password;
    delete updateFields._id;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
  }
};

export const logoutUser = (req, res) => {
  res.cookie('accessToken', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
  });
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
  });
  res.status(200).json({ success: true, message: 'User logged out successfully' });
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ success: false, message: 'Error fetching user profile', error: error.message });
  }
};

// Get all subscription plans (for users to browse)
export const getAllSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find()
      .populate('vendor', 'name image location phone email address cuisine')
      .populate({
        path: 'weekMeals.Monday.breakfast weekMeals.Monday.lunch weekMeals.Monday.dinner weekMeals.Monday.snacks weekMeals.Tuesday.breakfast weekMeals.Tuesday.lunch weekMeals.Tuesday.dinner weekMeals.Tuesday.snacks weekMeals.Wednesday.breakfast weekMeals.Wednesday.lunch weekMeals.Wednesday.dinner weekMeals.Wednesday.snacks weekMeals.Thursday.breakfast weekMeals.Thursday.lunch weekMeals.Thursday.dinner weekMeals.Thursday.snacks weekMeals.Friday.breakfast weekMeals.Friday.lunch weekMeals.Friday.dinner weekMeals.Friday.snacks weekMeals.Saturday.breakfast weekMeals.Saturday.lunch weekMeals.Saturday.dinner weekMeals.Saturday.snacks weekMeals.Sunday.breakfast weekMeals.Sunday.lunch weekMeals.Sunday.dinner weekMeals.Sunday.snacks',
        model: 'MenuItem'
      })
      .sort({ createdAt: -1 });
    
    console.log('Subscription plans with vendors:', plans.map(plan => ({
      planId: plan._id,
      vendor: plan.vendor ? {
        id: plan.vendor._id,
        name: plan.vendor.name,
        image: plan.vendor.image,
        location: plan.vendor.location
      } : null
    })));
    
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get subscription plans by vendor
export const getSubscriptionPlansByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const plans = await SubscriptionPlan.find({ vendor: vendorId })
      .populate('vendor', 'name image location')
      .populate({
        path: 'weekMeals.Monday.breakfast weekMeals.Monday.lunch weekMeals.Monday.dinner weekMeals.Monday.snacks weekMeals.Tuesday.breakfast weekMeals.Tuesday.lunch weekMeals.Tuesday.dinner weekMeals.Tuesday.snacks weekMeals.Wednesday.breakfast weekMeals.Wednesday.lunch weekMeals.Wednesday.dinner weekMeals.Wednesday.snacks weekMeals.Thursday.breakfast weekMeals.Thursday.lunch weekMeals.Thursday.dinner weekMeals.Thursday.snacks weekMeals.Friday.breakfast weekMeals.Friday.lunch weekMeals.Friday.dinner weekMeals.Friday.snacks weekMeals.Saturday.breakfast weekMeals.Saturday.lunch weekMeals.Saturday.dinner weekMeals.Saturday.snacks weekMeals.Sunday.breakfast weekMeals.Sunday.lunch weekMeals.Sunday.dinner weekMeals.Sunday.snacks',
        model: 'MenuItem'
      })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single subscription plan by ID (for users to view details)
export const getSubscriptionPlanById = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id)
      .populate('vendor', 'name image location phone email')
      .populate({
        path: 'weekMeals.Monday.breakfast weekMeals.Monday.lunch weekMeals.Monday.dinner weekMeals.Monday.snacks weekMeals.Tuesday.breakfast weekMeals.Tuesday.lunch weekMeals.Tuesday.dinner weekMeals.Tuesday.snacks weekMeals.Wednesday.breakfast weekMeals.Wednesday.lunch weekMeals.Wednesday.dinner weekMeals.Wednesday.snacks weekMeals.Thursday.breakfast weekMeals.Thursday.lunch weekMeals.Thursday.dinner weekMeals.Thursday.snacks weekMeals.Friday.breakfast weekMeals.Friday.lunch weekMeals.Friday.dinner weekMeals.Friday.snacks weekMeals.Saturday.breakfast weekMeals.Saturday.lunch weekMeals.Saturday.dinner weekMeals.Saturday.snacks weekMeals.Sunday.breakfast weekMeals.Sunday.lunch weekMeals.Sunday.dinner weekMeals.Sunday.snacks',
        model: 'MenuItem'
      });
    
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Subscription plan not found' });
    }
    
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- CART MANAGEMENT ---

// Get current user's cart
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.item');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, cart: user.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching cart', error: error.message });
  }
};

// Add or update an item in the cart
export const addOrUpdateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    if (!itemId || !quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Invalid item or quantity' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const existing = user.cart.find(i => i.item.toString() === itemId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      user.cart.push({ item: itemId, quantity });
    }
    await user.save();
    
    // Populate cart items before sending response
    const populatedUser = await User.findById(req.user._id).populate('cart.item');
    res.json({ success: true, cart: populatedUser.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating cart', error: error.message });
  }
};

// Update quantity of a cart item
export const updateCartItemQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const item = user.cart.find(i => i.item.toString() === itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });
    item.quantity = quantity;
    await user.save();
    
    // Populate cart items before sending response
    const populatedUser = await User.findById(req.user._id).populate('cart.item');
    res.json({ success: true, cart: populatedUser.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating cart item', error: error.message });
  }
};

// Remove an item from the cart
export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.cart = user.cart.filter(i => i.item.toString() !== itemId);
    await user.save();
    
    // Populate cart items before sending response
    const populatedUser = await User.findById(req.user._id).populate('cart.item');
    res.json({ success: true, cart: populatedUser.cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error removing cart item', error: error.message });
  }
};

// Clear the cart
export const clearCart = async (req, res) => {
  console.log('clearCart called for user:', req.user._id);
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('User not found:', req.user._id);
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.log('Clearing cart for user:', user._id);
    user.cart = [];
    await user.save();
    
    // Populate cart items before sending response
    const populatedUser = await User.findById(req.user._id).populate('cart.item');
    console.log('Cart cleared successfully for user:', user._id);
    res.json({ success: true, cart: populatedUser.cart });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ success: false, message: 'Error clearing cart', error: error.message });
  }
}; 

// Create a new user subscription
export const createUserSubscription = async (req, res) => {
  try {
    const { subscriptionPlan, vendor, startDate, duration } = req.body;
    const user = req.user ? req.user._id : req.body.user; // Prefer authenticated user
    if (!user || !subscriptionPlan || !vendor || !startDate || !duration) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }
    const newSub = await UserSubscription.create({
      user,
      subscriptionPlan,
      vendor,
      startDate,
      duration,
      paymentStatus: 'pending',
    });
    res.status(201).json({ success: true, data: newSub });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 

// Upload payment proof and update payment status
export const uploadPaymentProof = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const subscription = await UserSubscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    if (subscription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    subscription.paymentProof = `/uploads/payment-proofs/${req.file.filename}`;
    subscription.paymentStatus = 'pending';
    await subscription.save();
    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 

// Get all user subscriptions for the logged-in user
export const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user._id;
    let subs = await UserSubscription.find({ user: userId })
      .populate('subscriptionPlan')
      .populate('vendor', 'name email scanner');
    // Auto-expire subscriptions
    const today = new Date();
    today.setHours(0,0,0,0);
    for (let sub of subs) {
      if (sub.paymentStatus === 'approved') {
        const endDate = new Date(sub.startDate);
        endDate.setDate(endDate.getDate() + sub.duration);
        endDate.setHours(0,0,0,0);
        if (endDate < today) {
          sub.paymentStatus = 'expired';
          await sub.save();
        }
      }
    }
    // Re-fetch to get updated statuses
    subs = await UserSubscription.find({ user: userId })
      .populate('subscriptionPlan')
      .populate('vendor', 'name email scanner');
    res.json({ success: true, data: subs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 

// Delete a user subscription if expired
export const deleteUserSubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const { subscriptionId } = req.params;
    const sub = await UserSubscription.findOne({ _id: subscriptionId, user: userId });
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    if (sub.paymentStatus !== 'expired') {
      return res.status(400).json({ success: false, message: 'Only expired subscriptions can be deleted' });
    }
    await sub.deleteOne();
    res.json({ success: true, message: 'Subscription deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 

// Generate QR code data for a user subscription
export const getSubscriptionQrData = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user._id;
    const subscription = await UserSubscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    if (String(subscription.user) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    // Create a JWT payload for the QR code
    const payload = {
      subscriptionId: subscription._id,
      userId: userId,
      iat: Date.now(),
    };
    const qrToken = jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' });
    res.json({ success: true, qrData: qrToken });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating QR code', error: error.message });
  }
}; 