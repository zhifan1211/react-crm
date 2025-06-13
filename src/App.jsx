import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLoginPage from "./admin/AdminLoginPage";
import AdminHomePage from "./admin/AdminHomePage";
import AdminMemberListPage from "./admin/AdminMemberListPage";
import AdminPointTypeListPage from "./admin/AdminPointTypeListPage";
import AdminPointManagePage from "./admin/AdminPointManagePage";
import AdminRouteGuard from "./admin/components/AdminRouteGuard";
import AdminPointListPage from "./admin/AdminPointListPage";
import AdminManagePage from "./admin/AdminManagePage";
import AdminChangePasswordPage from "./admin/AdminChangePasswordPage"

import MemberRouteGuard from "./member/components/MemberRouteGuard";
import MemberHomePage from "./member/MemberHomePage";
import MemberLoginPage from "./member/MemberLoginPage";
import MemberRegisterPage from "./member/MemberRegisterPage";
import MemberPointListPage from "./member/MemberPointListPage";
import MemberEditPage from "./member/MemberEditPage";
import MemberChangePasswordPage from "./member/MemberChangePasswordPage";
import MemberResetPasswordPage from "./member/MemberResetPasswordPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminRouteGuard><AdminHomePage /></AdminRouteGuard>} />
        <Route path="/admin/member" element={<AdminRouteGuard><AdminMemberListPage /></AdminRouteGuard>} />
        <Route path="/admin/point-types" element={<AdminRouteGuard><AdminPointTypeListPage /></AdminRouteGuard>} />
        <Route path="/admin/member/:memberId/point" element={<AdminRouteGuard><AdminPointManagePage /></AdminRouteGuard>}/>
        <Route path="/admin/point-list" element={<AdminRouteGuard><AdminPointListPage /></AdminRouteGuard>} />
        <Route path="/admin/manage-admins" element={<AdminRouteGuard><AdminManagePage /></AdminRouteGuard>} />
        <Route path="/admin/change-password" element={<AdminRouteGuard><AdminChangePasswordPage /></AdminRouteGuard>} />


        <Route path="/member/login" element={<MemberLoginPage />} />
        <Route path="/member/register" element={<MemberRegisterPage />} />
        <Route path="/member/reset-password" element={<MemberResetPasswordPage />} />
        <Route path="/member" element={<MemberRouteGuard><MemberHomePage /></MemberRouteGuard>} />
        <Route path="/member/point" element={<MemberRouteGuard><MemberPointListPage /></MemberRouteGuard>} />
        <Route path="/member/edit" element={<MemberRouteGuard><MemberEditPage /></MemberRouteGuard>} />
        <Route path="/member/edit/change-password" element={<MemberRouteGuard><MemberChangePasswordPage /></MemberRouteGuard>} />


        <Route path="*" element={<h2>找不到頁面</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
