import mongoose from 'mongoose';

const BlacklistSchema = new mongoose.Schema({
	token: {
	type: String,
	required: true,
	ref: 'User',
  },
  expires: {
	type: Date,
	required: true,
  },
})

const Blacklist = mongoose.model('Blacklist', BlacklistSchema);
export default Blacklist;