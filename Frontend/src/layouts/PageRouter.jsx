import Account from "@/pages/Account"
import Analytics from "@/pages/Analytics"
import Login from "@/pages/Login"
import Machines from "@/pages/Machines"
import Modules from "@/pages/Modules"
import { Routes, Route, Navigate } from "react-router-dom"
import Admins from "@/pages/Admins"

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
            path='/admins'
            element={<Admins/>}
          />
          <Route
            path='/account'
            element={<Account/>}
          />
          <Route
            path='/dashboard'
            element={<Analytics/>}
          />
          <Route
            path='/machines'
            element={<Machines/>}
          />
          <Route
            path='/machines/:user_id'
            element={<Modules/>}
          />
          <Route
            path='/machines/:user_id/:module_id'
            element={<Machines/>}
          />
        </Routes>
  )
}

export default PageRouter
