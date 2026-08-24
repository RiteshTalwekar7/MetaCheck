import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User.js';
import { env } from '../../config/env.js';
import { AppError, ErrorCodes } from '../../utils/errors.js';
import { isDbConnected } from '../../config/db.js';

// In-memory user store for mock mode when MongoDB is not connected
const inMemoryUsers = new Map();

export async function seedDefaultUsers() {
  const defaultOfficer = {
    name: 'Inspector Rajesh Kumar',
    email: 'officer@metacheck.gov.in',
    password: 'Password@123',
    role: 'OFFICER',
    badgeNumber: 'LM-DEL-8942',
    department: 'Delhi Legal Metrology Enforcement Division',
  };

  const defaultAdmin = {
    name: 'Admin Controller Sharma',
    email: 'admin@metacheck.gov.in',
    password: 'AdminPassword@123',
    role: 'ADMIN',
    badgeNumber: 'LM-HQ-001',
    department: 'Directorate of Legal Metrology HQ',
  };

  if (isDbConnected()) {
    try {
      const existing = await User.findOne({ email: defaultOfficer.email });
      if (!existing) {
        const hash = await bcrypt.hash(defaultOfficer.password, 10);
        await User.create({ ...defaultOfficer, passwordHash: hash });
      }
      const existingAdmin = await User.findOne({ email: defaultAdmin.email });
      if (!existingAdmin) {
        const adminHash = await bcrypt.hash(defaultAdmin.password, 10);
        await User.create({ ...defaultAdmin, passwordHash: adminHash });
      }
    } catch (e) {
      console.warn('[Auth] Error seeding DB users:', e.message);
    }
  }

  // Always seed in-memory map
  const hashOfficer = await bcrypt.hash(defaultOfficer.password, 10);
  inMemoryUsers.set(defaultOfficer.email, {
    _id: 'user_officer_default_01',
    id: 'user_officer_default_01',
    ...defaultOfficer,
    passwordHash: hashOfficer,
  });

  const hashAdmin = await bcrypt.hash(defaultAdmin.password, 10);
  inMemoryUsers.set(defaultAdmin.email, {
    _id: 'user_admin_default_02',
    id: 'user_admin_default_02',
    ...defaultAdmin,
    passwordHash: hashAdmin,
  });
}

export async function registerUser(data) {
  const email = data.email.toLowerCase();

  if (isDbConnected()) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, 'A user with this email already exists.', 409);
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      name: data.name,
      email,
      passwordHash,
      role: data.role || 'OFFICER',
      badgeNumber: data.badgeNumber || '',
      department: data.department || 'Legal Metrology Enforcement',
    });

    return formatUserResponse(user);
  }

  // In-memory
  if (inMemoryUsers.has(email)) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, 'A user with this email already exists.', 409);
  }
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = {
    _id: `user_${Date.now()}`,
    id: `user_${Date.now()}`,
    name: data.name,
    email,
    passwordHash,
    role: data.role || 'OFFICER',
    badgeNumber: data.badgeNumber || '',
    department: data.department || 'Legal Metrology Enforcement',
  };
  inMemoryUsers.set(email, user);
  return formatUserResponse(user);
}

export async function loginUser(email, password) {
  const normalizedEmail = email.toLowerCase();
  let user = null;

  if (isDbConnected()) {
    user = await User.findOne({ email: normalizedEmail });
  }
  if (!user) {
    user = inMemoryUsers.get(normalizedEmail);
  }

  if (!user) {
    throw new AppError(ErrorCodes.AUTH_REQUIRED, 'Invalid email or password.', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError(ErrorCodes.AUTH_REQUIRED, 'Invalid email or password.', 401);
  }

  const token = jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      badgeNumber: user.badgeNumber,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return {
    accessToken: token,
    user: formatUserResponse(user),
  };
}

export async function getUserById(userId) {
  if (isDbConnected()) {
    const user = await User.findById(userId);
    if (user) return formatUserResponse(user);
  }

  for (const u of inMemoryUsers.values()) {
    if (u.id === userId || u._id === userId) {
      return formatUserResponse(u);
    }
  }
  return null;
}

function formatUserResponse(user) {
  return {
    id: user._id ? user._id.toString() : user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    badgeNumber: user.badgeNumber,
    department: user.department,
  };
}

