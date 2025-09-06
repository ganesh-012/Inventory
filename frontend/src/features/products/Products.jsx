
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState, useMemo, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AddProduct } from "../products/AddProduct";
import { useRecoilValue } from "recoil";
import { authAtom } from "../../store/authAtom";

const getProducts = async ({ pageParam = 1 , queryKey}) => {
  const [, token] = queryKey;
  console.log(token, 'in the get products')
  const response = await axios.get(`http://localhost:1432/api/product/products/?page=${pageParam}&limit=5`,{
    headers : {
      'Authorization' : `Bearer ${token}` 
    }
  });
  return response.data;
};

export function Products() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);

  const { ref, inView } = useInView();
  const queryClient = useQueryClient();

  const { token } = useRecoilValue(authAtom)
  console.log('token is', token)
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["Products", token],
    queryFn: getProducts,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.currentPage + 1 : undefined,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  const allProducts = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((item) => item.products);
  }, [data]);

  const categories = useMemo(() => {
    return Array.from(new Set(allProducts.map((p) => p.category)));
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [allProducts, search, categoryFilter]);

  const exportProductsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(15);

    const title = "Product List";
    const headers = [["Product Name", "SKU", "Category", "Quantity"]];

    const data = allProducts.map((product) => [
      product.name,
      product.sku,
      product.category,
      product.quantity,
    ]);

    doc.text(title, 15, 20);
    autoTable(doc, {
      startY: 25,
      head: headers,
      body: data,
    });
    doc.save("product_list.pdf");
  };

const deleteProduct = async (productId) => {
  return axios.delete(`http://localhost:1432/api/product/delete/${productId}`,{
    headers : {
      'Authorization' : `Bearer ${token}` 
    }
  });
};

const updateProduct = async ({ productId, updateData }) => {
  console.log("update data in update product:", updateData);
  return axios.patch(
    `http://localhost:1432/api/product/update/${productId}`,
    updateData,{
      headers : {
      'Authorization' : `Bearer ${token}` 
    }
    }
  );
};

// DELETE MUTATION
const deleteMutation = useMutation({
  mutationFn: deleteProduct,
  onMutate: async (productId) => {
    await queryClient.cancelQueries({ queryKey: ["Products"] });
    const previous = queryClient.getQueryData(["Products"]);

    queryClient.setQueryData(["Products"], (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((pg) => ({
          ...pg,
          products: (pg.products || []).filter((p) => p._id !== productId),
        })),
      };
    });

    return { previous };
  },
  onError: (_err, _vars, ctx) => {
    if (ctx?.previous) {
      queryClient.setQueryData(["Products"], ctx.previous);
    }
    if (_err.response?.status === 403) {
      alert("Permission denied only Admin allowed");
    } else {
      alert("Failed to delete product. Please try again.");
    }
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["Products"] });
  },
});

// UPDATE MUTATION
const updateMutation = useMutation({
  mutationFn: updateProduct,
  onMutate: async ({ productId, updateData }) => {
    await queryClient.cancelQueries({ queryKey: ["Products"] });
    const previous = queryClient.getQueryData(["Products"]);

    const newQuantity = parseInt(updateData.newQuantity) || 0;

    queryClient.setQueryData(["Products"], (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((pg) => ({
          ...pg,
          products: (pg.products || []).map((p) =>
            p._id === productId
              ? {
                  ...p,
                  quantity: p.quantity + newQuantity,
                }
              : p
          ),
        })),
      };
    });

    return { previous };
  },
  onError: (_err, _vars, ctx) => {
    if (ctx?.previous) {
      queryClient.setQueryData(["Products"], ctx.previous);
    }
    if (_err.response?.status === 403) {
      alert("Permission denied only Admin allowed");
    } else {
      alert("Failed to delete product. Please try again.");
    }
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["Products"] });
  },
});

//Handlers
const handleDelete = (productId) => {
  if (!productId) return alert("productId is missing");
  deleteMutation.mutate(productId);
};

const handleUpdate = (productId) => {
  const newQuantity = prompt("Enter the quantity you want to add") || "0";
  const newPrice = prompt("Enter the price of one piece") || "0";
  if (!productId) return alert("productId is missing");

  updateMutation.mutate({
    productId,
    updateData: { newQuantity, newPrice },
  });
};

  if (isLoading) return <div className="text-center">Loading...</div>;
  if (isError)
    return <div className="text-red-500 text-center">{error.message}</div>;

  return (
    <div className="w-full bg-white rounded-lg shadow-md">
    
      <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-4 border-b">
        <h5 className="text-2xl font-bold text-gray-800">Products</h5>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddProduct(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-500 py-2 px-4 text-sm font-semibold text-white hover:bg-blue-600"
          >
            ➕ Add Product
          </button>
          {showAddProduct && (
            <AddProduct onSuccess={(data) => {
              console.group('product data',data);
              setShowAddProduct(false)
            }}
            onCancel={() => setShowAddProduct(false)}
            />
          )}
          <button
            onClick={exportProductsPDF}
            className="flex items-center gap-2 rounded-lg bg-green-500 py-2 px-4 text-sm font-semibold text-white hover:bg-green-600"
          >
            📤 Export
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 p-4 border-b">
        <input
          type="text"
          placeholder="Search by name or SKU"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full md:w-1/3"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full md:w-1/4"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              {[
                "Product Name",
                "SKU",
                "Category",
                "Quantity",
                "Status",
                "Action",
              ].map((header) => (
                <th
                  key={header}
                  className="p-4 border-b font-semibold text-gray-600"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 text-center">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.sku}</td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-lg ${
                        item.quantity < 5
                          ? "bg-red-100 text-red-500"
                          : "bg-green-100 text-green-500"
                      }`}
                    >
                      {item.quantity < 5 ? "Low Stock" : "Available"}
                    </span>
                  </td>
                  <td className="p-3 flex justify-center gap-3">
                    <button 
                      className="px-4 py-1 bg-blue-500 text-white rounded-lg"
                      onClick={() => handleUpdate(item._id)}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="px-4 py-1 bg-red-500 text-white rounded-lg"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasNextPage && (
        <div ref={ref} className="p-4 text-center">
          {isFetchingNextPage ? <p>Loading more...</p> : <p>Scroll to load more</p>}
        </div>
      )}
    </div>
  );
}

