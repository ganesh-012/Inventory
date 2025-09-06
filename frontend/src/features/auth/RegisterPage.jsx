import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useSetRecoilState } from "recoil";
import { authAtom } from "../../store/authAtom";

const signupSchema = z
  .object({
    username: z.string(),
    password: z.string().min(6, "Password must be above 6 characters"),
    confirmPassword: z.string().min(6, "Password must be above 6 characters"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["Admin", "Staff"], {
      required_error: "Role is required",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setshowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setAuth = useSetRecoilState(authAtom)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const handleClick = () => {
    navigate("/login");
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:1432/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();
      console.log(resData);

      if (response.ok) {
        alert(resData.msg);
        setAuth({
          isAuthenticated : true,
          user : resData.user,
          token : resData.user
        })
        navigate('/')
        reset();
      } else {
        alert(resData.msg || "Registration failed.");
      }
    } catch (error) {
      alert(`Something went wrong: ${error.message}`);
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex justify-center items-center h-screen w-full">
        <div className="bg-white max-w-md w-full shadow-lg p-5">
          <p className="text-lg font-bold text-center uppercase">
            Register Form
          </p>
          <p className="text-sm text-center mb-2">
            Welcome back! Please fill all the details
          </p>

          <div className="mb-2">
            <label>Username:</label>
            <input
              type="text"
              placeholder="Enter your username"
              className="outline outline-black rounded w-full p-1"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="mb-2">
            <label>Email:</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="outline outline-black rounded w-full p-1"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-2">
            <label>Password:</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="outline outline-black rounded w-full p-1 pr-10"
                {...register("password")}
              />
              <span
                className="absolute top-2 right-2 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="mb-2">
            <label>Confirm Password:</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="re-enter your password"
                className="outline outline-black rounded w-full p-1 pr-10"
                {...register("confirmPassword")}
              />
              <span
                className="absolute top-2 right-2 cursor-pointer"
                onClick={() => setshowConfirm(!showConfirm)}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="mb-2">
            <label>select role:</label>
            <select
              className="outline outline-black rounded w-full p-1"
              defaultValue=""
              {...register("role", { required: "Role is required" })}
            >
              <option value="" disabled>Select your role</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
            </select>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="p-1 bg-green-500 hover:bg-green-600 text-white rounded-lg w-full mb-2 cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? "submitting..." : "submit"}
          </button>

          <p className="text-center">
            Already have an account?{" "}
            <span
              className="text-rose-500 cursor-pointer"
              onClick={handleClick}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </form>
  );
}
