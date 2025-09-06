import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { authAtom } from "../store/authAtom";
import { useRecoilValue } from "recoil";

const fetchStats = async({ queryKey }) => {
  const [,token] = queryKey;
  const res = await axios.get('http://localhost:1432/api/dashboard/getStats',{
    headers : {
      'Authorization' : `Bearer ${token}` 
    }
  });
  return res.data
}
export function SummaryCard() {
  const { token } = useRecoilValue(authAtom)
  const { data, isLoading, isError, error } = useQuery({
    queryKey : ['stats', token],
    queryFn : fetchStats
  })

  if(isLoading) return <div className="text-center text-green-500">loading...</div>
  if(isError) return <div className="text-red-500 text-center">{error.message}</div>
  console.log('data of the stats', data)


  return (
    <>
      <div className="grid grid-cols-4 gap-4 h-25 w-full mt-6">
        <div className="bg-white p-4 rounded-lg shadow-lg text-center">
          <p className="text-2xl font-bold">{data.totalProducts}</p>
          <p>Total Products</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-lg text-center">
          <p className="text-2xl font-bold">{data.totalOrders}</p>
          <p>Total Orders</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-lg text-center">
          <p className="text-2xl font-bold">{data.totalSuppliers}</p>
          <p>Total Suppliers</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-lg text-center">
          <p className="text-2xl font-bold">${data.totalRevenue}</p>
          <p>Total Revenue</p>
        </div>
      </div>
    </>
  );
}
