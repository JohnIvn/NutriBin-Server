import Login from "@/pages/Login"
import Machines from "@/pages/Machines"
import UserManagement from "@/pages/Users"
import { Routes, Route, Navigate } from "react-router-dom"

function PageRouter() {
  return (
        <Routes>
          <Route path="*" element={<h1>404 Not Found</h1>} />
          <Route
            path='/'
            element={
              <Navigate replace to={'/login'}/>
            }
          />
          <Route
            path='/login'
            element={<Login/>}
          />
          <Route
            path='/users'
            element={<UserManagement/>}
          />
          <Route
            path='/machines'
            element={<Machines/>}
          />
          <Route
            path='/machines/:user_id'
            element={<Machines/>}
          />
          <Route
            path='/machines/:user_id/:module_id'
            element={<Machines/>}
          />
        </Routes>
  )
}

export default PageRouter
