import { useRecoilValue } from "recoil"
import { authAtom } from "../store/authAtom"
import { Navigate, Outlet } from "react-router-dom"



export function ProtectedRoute(){
    const { isAuthenticated } = useRecoilValue(authAtom)
    return isAuthenticated ? <Outlet /> : <Navigate to='/login' />
}