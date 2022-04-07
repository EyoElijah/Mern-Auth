import express from 'express';
import { UserModel } from '../models/user.js';
import bcrypt from 'bcrypt';
import Joi from 'joi';

import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
import Token from '../models/token.js';

const router = express.Router();

router.post('/', async (req, res) => {
	try {
		const { error } = validate(req.body);
		if (error)
			return res.status(400).json({
				message: error.details[0].message,
			});

		const user = await UserModel.findOne({ email: req.body.email });

		if (!user) {
			return res.status(400).json({
				message: 'invalid email or password',
			});
		}
		const isValidPassword = bcrypt.compareSync(req.body.password, user.password);

		if (!isValidPassword) {
			return res.status(400).json({
				message: 'invalid email or password',
			});
		}

		// console.log(user.verified);
		if (!user.verified) {
			let token = await Token.findOne({
				userId: user._id,
			});
			if (!token) {
				const token = await new Token({
					userId: user._id,
					token: crypto.randomBytes(32).toString('hex'),
				}).save();

				const url = `${process.env.BASE_URL}users/${user._id}/verify/${token.token}`;
				await sendEmail(user.email, 'verify Email', url);
			}
			return res.status(400).json({
				message: 'Verify your email',
			});
		}
		const token = user.generateAuthToken();
		res.status(200).json({
			data: token,
			message: 'Logged in successfully',
		});
	} catch (error) {
		res.status(500).json(error);
	}
});

const validate = (data) => {
	const schema = Joi.object({
		email: Joi.string().required().email().label('Email'),
		password: Joi.string().required().label('Password'),
	});

	return schema.validate(data);
};

export default router;
