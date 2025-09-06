import { useState, useRef, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { authAtom } from "../store/authAtom";
import { useNavigate } from "react-router-dom";

export function Navbar({ toggleSidebar, setToggleSidebar }) {
  
  const [profileDrop, setProfileDrop] = useState(false);
  const auth = useRecoilValue(authAtom);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDrop(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    const confirm = window.confirm('Are you sure to logout?')
    if(confirm){
      console.log('called')
      localStorage.clear();
      navigate('/login')
    }
  }

  return (
    <nav className="flex flex-wrap justify-between items-center bg-white px-4 sm:px-6 py-3 shadow-md gap-3">
     
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => setToggleSidebar(!toggleSidebar)}
          className="p-2 rounded-md hover:bg-gray-100 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
        <h1 className="text-base sm:text-xl text-gray-800 font-medium">
          Hi, here’s what’s happening in your store
        </h1>
      </div>

      {/* Right: User Section */}
      <div className="flex items-center gap-2 flex-shrink-0 relative">
        <span className="hidden sm:block text-base sm:text-lg text-gray-800 font-medium">
          Welcome, {auth?.user?.username}
        </span>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDrop(!profileDrop)}
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-gray-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0 0 12 
                15.75a7.488 7.488 0 0 0-5.982 
                2.975m11.963 0a9 9 0 1 0-11.963 
                0m11.963 0A8.966 8.966 0 0 1 12 
                21a8.966 8.966 0 0 1-5.982-2.275M15 
                9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </button>

          {profileDrop && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100">
              <div className="px-4 py-3 border-b">
                <p className="text-sm text-gray-700 font-medium">{auth?.user?.username}</p>
                <p className="text-xs text-gray-500">{auth?.user?.email}</p>
              </div>
              <ul className="py-2 text-sm text-gray-700">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-default">
                  Role: <span className="font-medium">{auth?.user?.role}</span>
                </li>
                <li>
                  <button onClick={() => handleLogout()} className="w-full text-left px-4 py-2 hover:bg-gray-100">
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
