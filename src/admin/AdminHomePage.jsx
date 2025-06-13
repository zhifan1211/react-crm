import Navbar from "./components/AdminNavbar";

function AdminHomePage() {
  return (
    <>
      <Navbar />
      <div className="container px-0 py-4">
        <p>歡迎使用點數管理系統。</p>
        <p>請從上方選單選擇功能，例如查看會員列表或點數類型。</p>
      </div>
    </>
  );
}

export default AdminHomePage;
