import { registerUser, loginUser, getUserById } from './auth.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export async function register(req, res, next) {
  try {
    const user = await registerUser(req.body);
    return sendSuccess(res, { user }, 'User registered successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    return sendSuccess(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await getUserById(req.user.id);
    return sendSuccess(res, { user }, 'Current user profile');
  } catch (error) {
    next(error);
  }
}

