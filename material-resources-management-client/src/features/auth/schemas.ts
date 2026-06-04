import * as v from "valibot";

export const LoginSchema = v.object({
  email: v.pipe(v.string(), v.trim(), v.email("Please enter a valid email")),
  password: v.pipe(v.string(), v.minLength(8, "Password must be at least 8 characters")),
});

export type LoginInput = v.InferOutput<typeof LoginSchema>;
