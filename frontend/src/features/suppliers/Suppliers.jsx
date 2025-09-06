import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { useState, useMemo, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AddSupplier } from "../suppliers/AddSupplier";
import { useRecoilValue } from "recoil";
import { authAtom } from "../../store/authAtom";

const getSuppliers = async ({ pageParam = 1, queryKey }) => {
  const [, token] = queryKey;
  const response = await axios.get(
    `http://localhost:1432/api/supplier/suppliers/?page=${pageParam}&limit=7`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export function Suppliers() {
  const [search, setSearch] = useState("");
  const [showAddSupplier, setShowAddSupplier] = useState(false);

  const { ref, inView } = useInView();
  const queryClient = useQueryClient();
  const { token } = useRecoilValue(authAtom);
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["Suppliers", token],
    queryFn: getSuppliers,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.currentPage + 1 : undefined,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  const allSuppliers = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((item) => item.suppliers);
  }, [data]);

  const filteredProducts = useMemo(() => {
    return allSuppliers.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [allSuppliers, search]);

  const exportProductsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(15);

    const title = "Supplier List";
    const headers = [
      ["Supplier Name", "Contact Number", "Email", "Products Supplied"],
    ];

    const data = allSuppliers.map((supplier) => [
      supplier.name,
      supplier.contactNumber,
      supplier.email,
      supplier.productsSupplied && supplier.productsSupplied.length > 0
        ? supplier.productsSupplied.map((p) => p.name).join(", ")
        : "None",
    ]);

    doc.text(title, 15, 20);
    autoTable(doc, {
      startY: 25,
      head: headers,
      body: data,
    });
    doc.save("supplier_list.pdf");
  };

  const deleteSupplier = async (supplierId) => {
    return axios.delete(
      `http://localhost:1432/api/supplier/delete/${supplierId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  const updateSupplier = async ({ supplierId, newNumber }) => {
    console.log("update data in updateSupplier :", newNumber);
    return axios.patch(
      `http://localhost:1432/api/supplier/update/${supplierId}`,
      { contactNumber: newNumber },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  // DELETE MUTATION
  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onMutate: async (supplierId) => {
      await queryClient.cancelQueries({ queryKey: ["Suppliers"] });
      const previous = queryClient.getQueryData(["Suppliers"]);

      queryClient.setQueryData(["Suppliers"], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((pg) => ({
            ...pg,
            suppliers: (pg.suppliers || []).filter((p) => p._id !== supplierId),
          })),
        };
      });

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["Suppliers"], ctx.previous);
      }
      if (_err.response?.status === 403) {
        alert("Permission denied only Admin allowed");
      } else {
        alert("Failed to delete product. Please try again.");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["Suppliers"] });
    },
  });

  // UPDATE MUTATION
  const updateMutation = useMutation({
    mutationFn: updateSupplier,
    onMutate: async ({ supplierId, newNumber }) => {
      await queryClient.cancelQueries({ queryKey: ["Suppliers"] });
      const previous = queryClient.getQueryData(["Suppliers"]);

      queryClient.setQueryData(["Suppliers"], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((pg) => ({
            ...pg,
            suppliers: (pg.suppliers || []).map((p) =>
              p._id === supplierId ? { ...p, contactNumber: newNumber } : p
            ),
          })),
        };
      });

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["Suppliers"], ctx.previous);
      }
      if (_err.response?.status === 403) {
        alert("Permission denied only Admin allowed");
      } else {
        alert("Failed to delete product. Please try again.");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["Suppliers"] });
    },
  });

  //Handlers
  const handleDelete = (supplierId) => {
    if (!supplierId) return alert("supplier id is missing");
    deleteMutation.mutate(supplierId);
  };

  const handleUpdate = (supplierId) => {
    const newNumber = prompt("Enter the contact number to change");
    if (!supplierId) return alert("productId is missing");
    updateMutation.mutate({
      supplierId,
      newNumber,
    });
  };

  if (isLoading) return <div className="text-center">Loading...</div>;
  if (isError)
    return <div className="text-red-500 text-center">{error.message}</div>;

  console.log("data in the supplier page :", data);
  return (
    <div className="w-full bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-4 border-b">
        <h5 className="text-2xl font-bold text-gray-800">Suppliers</h5>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddSupplier(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-500 py-2 px-4 text-sm font-semibold text-white hover:bg-blue-600"
          >
            ➕ Add Supplier
          </button>
          {showAddSupplier && (
            <AddSupplier
              onSuccess={(data) => {
                console.group("supplier data", data);
                setShowAddSupplier(false);
              }}
              onCancel={() => setShowAddSupplier(false)}
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
          placeholder="Search by name of supplier"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full md:w-1/3"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              {[
                "Supplier Name",
                "Contact Number",
                "email",
                "Products Supplied",
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
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  No suppliers found
                </td>
              </tr>
            ) : (
              filteredProducts.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 text-center">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.contactNumber}</td>
                  <td className="p-3">{item.email}</td>
                  <td className="p-3">
                    {item.productsSupplied && item.productsSupplied.length > 0
                      ? item.productsSupplied
                          .map((product) => product.name)
                          .join(", ")
                      : "None"}
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
          {isFetchingNextPage ? (
            <p>Loading more...</p>
          ) : (
            <p>Scroll to load more</p>
          )}
        </div>
      )}
    </div>
  );
}
