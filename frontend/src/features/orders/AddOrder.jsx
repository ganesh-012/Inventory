import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { authAtom } from "../../store/authAtom";

const AddOrderSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  issuedTo: z.string().min(1, "Issued To is required"),
  purpose: z.string().min(3, "Purpose must be at least 3 characters"),
  pricePerItem: z.number().min(1, "Price must be at least 1"),
});

const fetchProducts = async (token) => {
  const response = await axios.get("http://localhost:1432/api/product/products",{
    headers : {
      'Authorization' : `Bearer ${token}` 
    }
  });
  return response.data.products;
};

export function AddOrder({ onSuccess, onCancel }) {
  const queryClient = useQueryClient();
  const auth = useRecoilValue(authAtom);
  const { token } = useRecoilValue(authAtom)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(AddOrderSchema),
  });

  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["productList"],
    queryFn: () => fetchProducts(token),
  });

  const handleAddOrder = async (data) => {
    console.log("new data in the backend request :", data);
    try {
      const response = await fetch('http://localhost:1432/api/order/add',{
        method : "POST",
        headers : {
          "Content-Type": "application/json",
          "Authorization" : `Bearer ${token}`
        },
        body: JSON.stringify(data),
      })
      const resData = await response.json();

      if(response.ok){
        alert(resData.msg);
        queryClient.invalidateQueries({queryKey : ['Orders']});
        reset();
        onSuccess();
      }else{
        return alert(resData.msg || 'creating order failed')
      }
    } catch (error) {
      return alert(`something went wrong : ${error.message}`)
    }
  };

  const onSubmit = (data) => {
    const newData = { ...data, issuedBy: auth.userId };
    handleAddOrder(newData);
  };

  if (isLoading) return <div className="text-center">Loading...</div>;
  if (isError)
    return <div className="text-red-500 text-center">{error.message}</div>;
  console.log("products in the add order page :", products);

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
          Add New Order
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <select
              {...register("productId")}
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
            >
              <option value="">Select a product</option>
              {Array.isArray(products) ? "true" : "false"}
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="text-sm text-red-500">{errors.productId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Issued To
            </label>
            <input
              {...register("issuedTo")}
              type="text"
              placeholder="eg: Ganesh"
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
            />
            {errors.issuedTo && (
              <p className="text-sm text-red-500">{errors.issuedTo.message}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Purpose
          </label>
          <textarea
            {...register("purpose")}
            placeholder="eg: fever"
            className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
            rows={2}
          />
          {errors.purpose && (
            <p className="text-sm text-red-500">{errors.purpose.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              {...register("quantity", { valueAsNumber: true })}
              type="number"
              placeholder="eg: 10"
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
            />
            {errors.quantity && (
              <p className="text-sm text-red-500">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              pricePerItem
            </label>
            <input
              {...register("pricePerItem", { valueAsNumber: true })}
              type="number"
              placeholder="eg: 5"
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
            />
            {errors.pricePerItem && (
              <p className="text-sm text-red-500">
                {errors.pricePerItem.message}
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
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
      </form>
    </div>
  );
}
