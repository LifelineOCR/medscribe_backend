import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
	firstName: {
	type: String,
	required: [true, 'Please provide a name'],
	minlength: 3,
	maxlength: 30,
  },
  lastName: {
	type: String,
	required: [true, 'Please provide a name'],
	minlength: 3,
	maxlength: 30,
  },
  email: {
	type: String,
	required: [true, 'Please provide an email'],
	unique: true,
  },
  password: {
	type: String,
	required: [true, 'Please provide a password'],
	minlength: 6,
  },
  role: {
	type: String,
	enum: ['user', 'admin'],
	default: 'user',
  },
  profilePicture: {
	type: String,
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

const User = mongoose.model('User', UserSchema);
export default User;