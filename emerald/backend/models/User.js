const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// What a user looks like in the database
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  address: {
    street: String, city: String, state: String,
    zip: String, country: String
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdAt: { type: Date, default: Date.now }
});

// Normalize and hash before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('email')) this.email = this.email.trim().toLowerCase();
  if (this.isModified('name')) this.name = this.name.trim();
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(String(this.password), 12);
  next();
});

// Compare entered password with hashed one
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(String(enteredPassword), this.password);
};

module.exports = mongoose.model('User', userSchema);
