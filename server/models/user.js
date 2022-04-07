import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import PasswordComplexity from 'joi-password-complexity';
import dotenv from 'dotenv';
dotenv.config();

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	verified: {
		type: Boolean,
		default: false,
	},
});

userSchema.methods.generateAuthToken = function () {
	const token = jwt.sign(
		{
			id: this._id,
			name: this.firstName,
		},
		process.env.SECRETE_KEY,
		{
			expiresIn: '1d',
		}
	);
	return token;
};

const validate = (data) => {
	const schema = Joi.object({
		firstName: Joi.string().required().label('First Name'),
		lastName: Joi.string().required().label('Last Name'),
		email: Joi.string().required().email().label('Email'),
		password: PasswordComplexity().required().label('Password'),
	});

	return schema.validate(data);
};

const UserModel = mongoose.model('User', userSchema);

export { UserModel, validate };
