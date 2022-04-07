import express from 'express';
import { UserModel, validate } from '../models/user.js';
import bcrypt from 'bcrypt';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
import Token from '../models/token.js';

const router = express.Router();

router.post('/', async (req, res) => {
	try {
		const { error } = validate(req.body);
		console.log(error);
		if (error)
			return res.status(400).json({
				message: error.details[0].message,
			});
		let user = await UserModel.findOne({ email: req.body.email });
		if (user) {
			return res.status(409).json({
				message: 'Email already exist',
			});
		}
		const salt = bcrypt.genSaltSync(16);
		const hashedPassword = bcrypt.hashSync(req.body.password, salt);
		user = await new UserModel({ ...req.body, password: hashedPassword }).save();

		const token = await new Token({
			userId: user._id,
			token: crypto.randomBytes(32).toString('hex'),
		}).save();

		const url = `${process.env.BASE_URL}users/${user._id}/verify/${token.token}`;
		await sendEmail(user.email, 'verify Email', url);
		res.status(201).json({
			message: 'please verify your email account',
		});
	} catch (error) {
		res.status(500).json(error.message);
	}
});

router.get('/:id/verify/:token', async (req, res) => {
	try {
		const user = await UserModel.findOne({ _id: req.params.id });
		if (!user)
			return res.status(400).send({
				message: 'invalid link',
			});
		const token = await Token.findOne({
			userId: user._id,
			token: req.params.token,
		});
		if (!token)
			return res.status(400).send({
				message: 'invalid link',
			});
		await UserModel.updateOne({ _id: user._id, verified: true });
		await token.remove();
		res.status(200).json({
			message: 'user verfied successfully',
		});
	} catch (error) {
		res.status(5000).json(error);
	}
});

export default router;
