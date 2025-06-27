import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import HomePage from "./pages/HomePage";
import MemberRegisterPage from "./pages/MemberRegisterPage";
import MemberResetPasswordPage from "./pages/MemberResetPasswordPage";

import AdminLoginPage from "./admin/AdminLoginPage";
import AdminHomePage from "./admin/AdminHomePage";
import AdminMemberListPage from "./admin/AdminMemberListPage";
import AdminPointTypeListPage from "./admin/AdminPointTypeListPage";
import AdminPointManagePage from "./admin/AdminPointManagePage";
import AdminRouteGuard from "./admin/components/AdminRouteGuard";
import AdminPointListPage from "./admin/AdminPointListPage";
import AdminManagePage from "./admin/AdminManagePage";
import AdminItemListPage from "./admin/AdminItemListPage";

import MemberRouteGuard from "./member/components/MemberRouteGuard";
import MemberCardPage from "./member/MemberCardPage";
import MemberPointListPage from "./member/MemberPointListPage";
import MemberEditPage from "./member/MemberEditPage";
import MemberItemListPage from "./member/MemberItemListPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminRouteGuard><AdminHomePage /></AdminRouteGuard>} />
          <Route path="/admin/member" element={<AdminRouteGuard><AdminMemberListPage /></AdminRouteGuard>} />
          <Route path="/admin/point-types" element={<AdminRouteGuard><AdminPointTypeListPage /></AdminRouteGuard>} />
          <Route path="/admin/member/:memberId/point" element={<AdminRouteGuard><AdminPointManagePage /></AdminRouteGuard>}/>
          <Route path="/admin/point-list" element={<AdminRouteGuard><AdminPointListPage /></AdminRouteGuard>} />
          <Route path="/admin/manage-admins" element={<AdminRouteGuard><AdminManagePage /></AdminRouteGuard>} />
          <Route path="/admin/item-list" element={<AdminRouteGuard><AdminItemListPage /></AdminRouteGuard>} />

          <Route path="/member/register" element={<MemberRegisterPage />} />
          <Route path="/member/reset-password" element={<MemberResetPasswordPage />} />
          <Route path="/member" element={<MemberRouteGuard><MemberCardPage /></MemberRouteGuard>} />
          <Route path="/member/point" element={<MemberRouteGuard><MemberPointListPage /></MemberRouteGuard>} />
          <Route path="/member/edit" element={<MemberRouteGuard><MemberEditPage /></MemberRouteGuard>} />
          <Route path="/member/item-list" element={<MemberRouteGuard><MemberItemListPage /></MemberRouteGuard>} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
