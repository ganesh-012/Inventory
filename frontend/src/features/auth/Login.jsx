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
    email: z.string().email('invalid email'),
    password: z.string().min(6, "Password must be above 6 characters"),
  })

export function Login() {
  const setAuth = useSetRecoilState(authAtom)
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const handleClick = () => {
    navigate("/register");
  };

  const onSubmit = async (data) => {
    console.log(data);
    try {
      const response = await fetch("http://localhost:1432/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();
      console.log(resData);

      if (response.ok) {
        alert(resData.msg)
        localStorage.setItem('token',resData.token)
        setAuth({
          isAuthenticated : true,
          user : resData.user,
          token : resData.token
        })
        navigate('/')
        reset();
      } else {
        alert(resData.msg || "Login failed.");
      }
    } catch (error) {
      alert(`Something went wrong: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex justify-center items-center h-screen w-full">
        <div className="bg-white max-w-md w-full shadow-lg p-5">
          <p className="text-lg font-bold text-center">Login Form</p>
          <p className="text-sm text-center mb-2">
            Welcome back! Please fill all the details
          </p>

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

          <button
            type="submit"
            className="p-1 bg-green-500 rounded-lg w-full mb-2 cursor-pointer"
          >
            Submit
          </button>

          <p className="text-center">
            Don't have an account?{" "}
            <span
              className="text-rose-500 cursor-pointer"
              onClick={handleClick}
            >
              Register
            </span>
          </p>
        </div>
      </div>
    </form>
  );
}
