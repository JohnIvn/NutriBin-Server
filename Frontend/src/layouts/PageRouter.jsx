import Login from "@/pages/Login"
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
        </Routes>
  )
}

export default PageRouter
