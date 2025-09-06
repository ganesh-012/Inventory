import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRecoilValue } from "recoil";
import { authAtom } from "../../store/authAtom";

const AddOrderSchema = z.object({
  name: z.string().min(1, "Please enter the name"),
  email: z.string().email("enter the valid email"),
  address: z.string().min(1, "Address is required"),
  contactNumber: z.number().min(1, "contact number is required"),
});

export function AddSupplier({ onSuccess, onCancel }) {
  const queryClient = useQueryClient();
  const { token } = useRecoilValue(authAtom)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(AddOrderSchema),
  });

  const handleAddOrder = async (data) => {
    console.log("new data in the backend request :", data);
    try {
      const response = await fetch(
        "http://localhost:1432/api/supplier/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization" : `Bearer ${token}`
          },
          body: JSON.stringify(data),
        }
      );
      const resData = await response.json();

      if (response.ok) {
        alert(resData.msg);
        queryClient.invalidateQueries({ queryKey: ["Suppliers"] });
        reset();
        onSuccess();
      } else {
        return alert(resData.msg || "creating supplier failed");
      }
    } catch (error) {
      return alert(`something went wrong : ${error.message}`);
    }
  };

  const onSubmit = (data) => {
    handleAddOrder(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
        onClick={onCancel}
      ></div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 transform transition-all scale-95 animate-fadeIn overflow-y-auto max-h-[90vh]"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Add New Supplier
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Supplier Name
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="eg: Ganesh"
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
            />
            {errors.name && (
              <p className="text-sm text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              email
            </label>
            <input
              {...register("email")}
              type="text"
              placeholder="eg: ganesh@gmail.com"
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <textarea
            {...register("address")}
            placeholder="eg: uppaka, pinapaka, bhadradri kothagudem"
            className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
            rows={2}
          />
          {errors.address && (
            <p className="text-sm text-red-500">{errors.address.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-50 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Number
            </label>
            <input
              {...register("contactNumber", { valueAsNumber: true })}
              type="number"
              placeholder="eg: +91 7719"
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
            />
            {errors.contactNumber && (
              <p className="text-sm text-red-500">
                {errors.contactNumber.message}
              </p>
            )}
          </div>
          <div className="mt-5 flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-900 transition"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
