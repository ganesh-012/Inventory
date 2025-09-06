
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState, useMemo, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AddOrder } from "../orders/AddOrder";
import { useRecoilValue } from "recoil";
import { authAtom } from "../../store/authAtom";

const getOrders = async ({ pageParam = 1 , queryKey}) => {
  const [, token] = queryKey
  const response = await axios.get(`http://localhost:1432/api/order/orders/?page=${pageParam}&limit=7`,{
    headers : {
      'Authorization' : `Bearer ${token}` 
    }
  });
  console.log(response.data, 'in the orders page')
  return response.data;
};

export function Orders() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showAddOrder, setShowAddOrder] = useState(false);

  const { ref, inView } = useInView();
  const queryClient = useQueryClient();
  const { token } = useRecoilValue(authAtom)

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["Orders", token],
    queryFn: getOrders,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.currentPage + 1 : undefined,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  const allOrders = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((item) => item.orders);
  }, [data]);


  const filteredProducts = useMemo(() => {
    return allOrders.filter((p) => {
      const matchesSearch =
        p.productId.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory =
        categoryFilter === "" || p.status === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [allOrders, search, categoryFilter]);

  const exportProductsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(15);

    const title = "Product List";
    const headers = [["Product Name", "Quantity", "Issued To", "Purpose","Issued By", "status"]];

    const data = allOrders.map((order) => [
      order.productId.name,
      order.quantity,
      order.issuedTo,
      order.purpose,
      order.issuedBy.username,
      order.status
    ]);

    doc.text(title, 15, 20);
    autoTable(doc, {
      startY: 25,
      head: headers,
      body: data,
    });
    doc.save("orders_list.pdf");
  };

const deleteProduct = async (orderId) => {
  return axios.delete(`http://localhost:1432/api/order/delete/${orderId}`,{
    headers : {
      'Authorization' : `Bearer ${token}` 
    }
  });
};

const updateProduct = async ({ orderId, newStatus }) => {
  console.log("update data in update product:", newStatus);
  return axios.patch(
  `http://localhost:1432/api/order/update/${orderId}`, 
  { status: newStatus }, 
  {
    headers: {
      'Authorization': `Bearer ${token}` 
    }
  }
);
};

// DELETE MUTATION
const deleteMutation = useMutation({
  mutationFn: deleteProduct,
  onMutate: async (orderId) => {
    await queryClient.cancelQueries({ queryKey: ["Orders"] });
    const previous = queryClient.getQueryData(["Orders"]);

    queryClient.setQueryData(["Orders"], (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((pg) => ({
          ...pg,
          orders: (pg.orders || []).filter((p) => p._id !== orderId),
        })),
      };
    });

    return { previous };
  },
  onError: (_err, _vars, ctx) => {
    if (ctx?.previous) {
      queryClient.setQueryData(["Orders"], ctx.previous);
    }
    alert("Failed to delete order. Please try again.");
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["Orders"] }); // ✅ fixed
  },
});

// UPDATE MUTATION
const updateMutation = useMutation({
  mutationFn: updateProduct,
  onMutate: async ({ orderId, newStatus }) => {
    await queryClient.cancelQueries({ queryKey: ["Orders"] });
    const previous = queryClient.getQueryData(["Orders"]);

    queryClient.setQueryData(["Orders"], (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((pg) => ({
          ...pg,
          orders: (pg.orders || []).map((p) =>
            p._id === orderId
              ? { ...p, status: newStatus }
              : p
          ),
        })),
      };
    });

    return { previous };
  },
  onError: (_err, _vars, ctx) => {
    if (ctx?.previous) {
      queryClient.setQueryData(["Orders"], ctx.previous);
    }
    alert("Failed to update order. Please try again.");
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["Orders"] });
  },
});

//Handlers
const handleDelete = (orderId) => {
  if (!orderId) return alert("orderId is missing"); 
  deleteMutation.mutate(orderId);
};

const handleUpdate = (orderId) => {
  const newStatus =
  prompt("Enter the status of the order (eg: issued, returned)") || "issued";
  if (!orderId) return alert("orderId is missing");

  updateMutation.mutate({
    orderId,
    newStatus,
  });
};


  if (isLoading) return <div className="text-center">Loading...</div>;
  if (isError)
    return <div className="text-red-500 text-center">{error.message}</div>;
  console.log('data in the orders page :',data)
  return (
    <div className="w-full bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-4 border-b">
        <h5 className="text-2xl font-bold text-gray-800">Orders</h5>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddOrder(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-500 py-2 px-4 text-sm font-semibold text-white hover:bg-blue-600"
          >
            ➕ Create Order
          </button>
          {showAddOrder && (
            <AddOrder onSuccess={(data) => {
              console.group('product data',data);
              setShowAddOrder(false)
            }}
            onCancel={() => setShowAddOrder(false)}
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
          placeholder="Search by product Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full md:w-1/3"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full md:w-1/4"
        >
          <option value="issued">issued</option>
          <option value="returned">returned</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              {[
                "Product Name",
                "Quantity",
                "Issued To",
                "Purpose",
                "Issued By",
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
                  <td className="p-3">{item.productId.name}</td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3">{item.issuedTo}</td>
                  <td className="p-3">{item.purpose}</td>
                  <td className="p-3">{item.issuedBy.username}</td>
                  <td className={`p-3 ${item.status === 'issued' ?  'text-green-500' : 'text-red-500'}`}>{item.status}</td>
                  
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

