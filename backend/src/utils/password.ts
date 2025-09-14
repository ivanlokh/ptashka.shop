import bcrypt from 'bcryptjs';

// @desc    Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

// @desc    Compare password with hashed password
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
