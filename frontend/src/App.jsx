import { Routes, Route, BrowserRouter } from "react-router-dom";
import { RegisterPage } from "./features/auth/RegisterPage";
import { Login } from "./features/auth/Login";
import Dashboard from "./features/dashboard/Dashboard";
import { Products } from "./features/products/Products";
import { Orders } from "./features/orders/Orders";
import { DashboardLayout } from "./layout/DashboardLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Suppliers } from "./features/suppliers/Suppliers";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<RegisterPage></RegisterPage>}></Route>
          <Route path="/login" element={<Login></Login>}></Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path='/' element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/supplier" element={<Suppliers />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
