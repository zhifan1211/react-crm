import Navbar from "./components/MemberNavbar";

function MemberHomePage() {
  return (
    <div>
      <Navbar/>
      <div className="container px-0 py-4">
        <h2>會員首頁</h2>
        <p>歡迎使用會員系統。</p>
        <p>請從上方選單選擇功能。</p>
      </div>
    </div>
  );
}

export default MemberHomePage;
