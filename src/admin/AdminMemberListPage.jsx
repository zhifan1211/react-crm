import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/AdminNavbar";

function AdminMemberList() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ACTIVE");

  const fetchMembers = async () => {
    try {
      const res = await fetch("http://localhost:8081/admin/member", {
        method: "GET",
        credentials: "include",
      });
      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        setMembers(resData.data);
      } else {
        alert("載入會員失敗：" + resData.message);
      }
    } catch (err) {
      alert("錯誤：" + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px", fontFamily: "Arial" }}>
        <h2>會員列表</h2>
        <div style={{ marginBottom: "10px" }}>
          <button
            onClick={() => setFilterStatus("ACTIVE")}
            style={{ fontWeight: filterStatus === "ACTIVE" ? "bold" : "normal" }}
          >
            啟用中
          </button>
          <button
            onClick={() => setFilterStatus("INACTIVE")}
            style={{ marginLeft: "10px", fontWeight: filterStatus === "INACTIVE" ? "bold" : "normal" }}
          >
            已停用
          </button>
          <button
            onClick={() => setFilterStatus("ALL")}
            style={{ marginLeft: "10px", fontWeight: filterStatus === "ALL" ? "bold" : "normal" }}
          >
            全部
          </button>
        </div>
        {loading ? (
          <p>載入中...</p>
        ) : (
          <table border="1" cellPadding="5" cellSpacing="0">
            <thead>
              <tr>
                <th>會員編號</th>
                <th>姓名</th>
                <th>性別</th>
                <th>電話</th>
                <th>生日</th>
                <th>等級</th>
                <th>Email</th>
                <th>地區</th>
                <th>剩餘點數</th>
                <th>是否啟用</th>
                <th>建立時間</th>
                <th>點數管理</th>
                <th>啟用/停用</th>
              </tr>
            </thead>
            <tbody>
              {members
                .filter((m) =>
                  filterStatus === "ALL" ? true :
                  filterStatus === "ACTIVE" ? m.active :
                  !m.active
                )
                .map((m) => (
                <tr key={m.memberId}>
                  <td>{m.memberId}</td>
                  <td>{m.lastName + m.firstName}</td>
                  <td>{m.gender === "MALE" ? "男" : "女"}</td>
                  <td>{m.phoneNumber}</td>
                  <td>{m.birthDate || "-"}</td>
                  <td>{m.level === "PASSER" ? "非正式" : m.level === "FORMAL" ? "正式" : "-"}</td>
                  <td>{m.email}</td>
                  <td>{m.region}</td>
                  <td>{m.remainPoint ?? 0}</td>
                  <td>{m.active ? "是" : "否"}</td>
                  <td>{m.createdAt.slice(0, 10)}</td>
                  <td>
                    <button onClick={() => navigate(`/admin/member/${m.memberId}/point`, {
                      state: { memberName: m.lastName + m.firstName }})}>
                      點數管理
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={async () => {
                        const confirmMsg = m.active ? "確定要停用該會員？" : "確定要重新啟用該會員？";
                        if (!window.confirm(confirmMsg)) return;

                        try {
                          const res = await fetch(`http://localhost:8081/admin/member/${m.memberId}/toggle-active`, {
                            method: "PATCH",
                            credentials: "include",
                          });
                          const resData = await res.json();
                          if (res.ok && resData.status === 200) {
                            alert("狀態切換成功！");
                            fetchMembers(); // 重新載入
                          } else {
                            alert("切換失敗：" + resData.message);
                          }
                        } catch (err) {
                          alert("錯誤：" + err.message);
                        }
                      }}
                    >
                      {m.active ? "停用" : "啟用"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminMemberList;
