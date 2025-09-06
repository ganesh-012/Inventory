
# StoreHouse

An Inventory Management Web Application built with the MERN stack (MongoDB, Express, React, Node.js).
It helps businesses efficiently manage products, suppliers, and orders with role-based access (Admin & Staff).


## Screenshots

![dashboard Screenshot](https://github.com/ganesh-012/Inventory/blob/9ed472fe6beeb2235c3c60a69fefc9595d0533bd/Screenshot%202025-08-29%20215523.png)
![products Screenshot](https://github.com/ganesh-012/Inventory/blob/9ed472fe6beeb2235c3c60a69fefc9595d0533bd/Screenshot%202025-08-29%20215551.png)
![orders Screenshot](https://github.com/ganesh-012/Inventory/blob/9ed472fe6beeb2235c3c60a69fefc9595d0533bd/Screenshot%202025-08-29%20215616.png)
![register Screenshot](https://github.com/ganesh-012/Inventory/blob/9ed472fe6beeb2235c3c60a69fefc9595d0533bd/Screenshot%202025-08-29%20215641.png) ![login Screenshot](https://github.com/ganesh-012/Inventory/blob/9ed472fe6beeb2235c3c60a69fefc9595d0533bd/Screenshot%202025-08-29%20215654.png)



## Features

🔐 Authentication & Authorization (JWT-based login/register)

👩‍💼 Role-based access control

Admin → Full CRUD on Products, Orders, Suppliers

Staff → Limited access (view, add, update orders)

📦 Product Management (Add, update, delete, stock tracking)

🚚 Supplier Management (Add, update, delete, export supplier list as PDF)

🛒 Order Management (Track issued products, purpose, and users)

📊 Dashboard with charts & summary cards

📧 Email Notifications when stock goes below threshold

⚡ Optimistic UI updates with React Query mutations

🛡️ Protected Routes

Zod → For validating data



## Tech Stack

**Client:** 

⚛️ React (Vite setup)

🎨 Tailwind CSS

🔄 React Query (data fetching, caching, mutations, optimistic updates)

🔐 Recoil (global state management)

📊 Chart.js (data visualization)

⚛️ React Query Forms (login,register and other pages)

**Server:** 

🟢 Node.js

⚡ Express.js

🗄️ MongoDB + Mongoose

🔑 JWT (JSON Web Token authentication)

🔐 bcrypt (password hashing)

📧 Nodemailer (email notifications)


## Installation

1️⃣ Clone the repo  
git clone https://github.com/ganesh-012/Inventory.git   
cd inventory-management

2️⃣ Setup Backend  
cd backend  
npm install

3️⃣ Setup Frontend  
cd frontend  
npm install     

finally - npm start to run project



## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

PORT=your_server_port  
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password


## User Roles

Admin  
Full control (Products, Orders, Suppliers)

Staff  
Limited access (view & update orders, suppliers list)
## Email Notifications

When product stock drops below threshold, an email is sent to the supplier automatically.

Implemented with Nodemailer inside backend services.
## Contributing

Contributions are always welcome!

For major changes, please open an issue first to discuss what you’d like to change.


## Authors

- [@Ganesh pandrameesu](https://www.github.com/ganesh-012)


