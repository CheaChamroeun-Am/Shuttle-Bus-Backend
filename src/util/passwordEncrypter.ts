import bcrypt from "bcrypt";
const saltRounds = 10;

// Password encryption
export const encryptPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

// Password comparison encryption
export const comparePassword = async (password: string, hash: string) => {
  const result = await bcrypt.compare(password, hash);
  return result;
};
