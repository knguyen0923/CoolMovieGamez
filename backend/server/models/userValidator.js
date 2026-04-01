const z = require("zod");

// validates when new user creates an account
const newUserValidation = (data) => {
  const registerValidationSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    username: z.string().min(6, "Username must be 6 characters or more"),
    email: z.string().email("Please input a valid email"),
    password: z.string().min(8, "Password must be 8 or more characters").trim(),
  });

  return registerValidationSchema.safeParse(data);
};

// validate user request when logging in
const userLoginValidation = (data) => {
  const loginValidationSchema = z.object({
    username: z.string().min(1, "Username or email is required"),
    password: z.string().min(8, "Password must be 8 or more characters").trim(),
  });

  return loginValidationSchema.safeParse(data);
};

module.exports.newUserValidation = newUserValidation;
module.exports.userLoginValidation = userLoginValidation;