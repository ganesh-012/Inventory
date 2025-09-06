import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { authAtom } from "../../store/authAtom";

const addProductSchema = z.object({
  name: z.string().min(1, "please enter the name"),
  sku: z.string().min(1, "please provide sku"),
  description: z.string().min(1, "Minimum should be 20 characters"),
  category: z.string().min(1, "category is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  pricePerItem: z.number().min(1, "price must be at least 1"),
  supplierId : z.string().min(1, 'supplier name is required')
});

const fetchSuppliers = async(token) => {
  const res = await axios.get('http://localhost:1432/api/supplier/suppliers',{
    headers : {
      'Authorization' : `Bearer ${token}` 
    }
  })
  console.log(res.data.suppliers)
  return res.data.suppliers
}

export function AddProduct({ onSuccess, onCancel }) {
  const queryClient = useQueryClient();
  const { token } = useRecoilValue(authAtom)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addProductSchema),
  });

  const { data : suppliers, isLoading, isError, error } = useQuery({
    queryKey : ['suppliersList'],
    queryFn : () => fetchSuppliers(token),
  })

  const handleAddProduct = async (data) => {
    try {
      const response = await fetch('http://localhost:1432/api/product/add',{
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
        queryClient.invalidateQueries({queryKey : ['Products']});
        reset();
        onSuccess();
      }else{
        return alert(resData.msg || 'creating product failed')
      }
    } catch (error) {
      return alert(`something went wrong : ${error.message}`)
    }
  };
  const onSubmit = (data) => {
    if (!data) return alert("Data is missing from form");
    handleAddProduct(data);
  };

  if (isLoading) return <div className="text-center">Loading...</div>;
  if (isError)
    return <div className="text-red-500 text-center">{error.message}</div>;
  console.log("suppliers in add product page :", suppliers);

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
          Add New Product
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              {...register("name", { required: true })}
              type="text"
              placeholder="eg: Paracetamol"
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              SKU
            </label>
            <input
              {...register("sku", { required: true })}
              type="text"
              placeholder="eg: EI-43"
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
            />
            {errors.sku && (
              <p className="text-sm text-red-500">{errors.sku.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Supplier Name
            </label>
            <select
              {...register('supplierId')}
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
            >
              <option value="">choose Supplier</option>
              {suppliers.map((supplier) => (
                 <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}

            </select>
            {errors.supplierId && (
              <p className="text-sm text-red-500">{errors.supplierId.message}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            {...register("description", { required: true })}
            placeholder="eg: It is used to reduce temperature"
            className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
            rows={2}
          />
          {errors.description && (
            <p className="text-sm text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <input
              {...register("category", { required: true })}
              type="text"
              placeholder="eg: Medicine"
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
            />
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              {...register("quantity", { valueAsNumber : true })}
              type="number"
              placeholder="eg: 30"
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
            />
            {errors.quantity && (
              <p className="text-sm text-red-500">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price Per Item
            </label>
            <input
              {...register("pricePerItem", { valueAsNumber : true })}
              type="number"
              placeholder="eg: 100"
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
