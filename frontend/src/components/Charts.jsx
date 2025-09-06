import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register( CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement );


import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { authAtom } from "../store/authAtom";
 
const fetchStats = async({ queryKey }) => {
  const [,token] = queryKey
  const res = await axios.get('http://localhost:1432/api/dashboard/getStats',{
    headers : {
      "Authorization" : `Bearer ${token}`
    }
  });
  return res.data
}


export function Charts() {
  const { token } = useRecoilValue(authAtom)
  const { data : stats, isLoading, isError, error } = useQuery({
    queryKey : ['stats',token],
    queryFn : fetchStats
  })

  if(isLoading) return <div className="text-center text-green-500">loading...</div>
  if(isError) return <div className="text-red-500 text-center">{error.message}</div>


  const data = {
    labels: ["Products", "Orders", "suppliers"],
    datasets: [
      {
        label: "Sales",
        data: [stats.totalProducts, stats.totalOrders, stats.totalSuppliers],
        backgroundColor: [
          "rgba(18, 227, 255, 0.67)",
          "rgba(246, 70, 88, 1)",
          "rgba(0, 255, 88, 1)"
        ],
        borderRadius : 5
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Monthly Sales" },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Monthly Sales" },
    },
  };

  return (
    <div className="grid grid-cols-3 gap-2 rounded-lg mt-5">
      <div className="bg-white shadow-lg col-span-2 p-4">
        <Bar data={data} options={barOptions} />
      </div>
      <div className="bg-white shadow-lg p-4 flex items-center justify-center">
        <Doughnut data={data} options={doughnutOptions} />
      </div>
    </div>
  );
}
