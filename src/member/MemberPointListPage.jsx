import { useEffect, useState } from "react";
import Navbar from "./components/MemberNavbar";

function MemberPointListPage() {
  const [points, setPoints] = useState([]);
  const [total, setTotal] = useState(0);
  const [nearestExpiry, setNearestExpiry] = useState("-");

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const res = await fetch("http://localhost:8081/member/point", {
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok && data.status === 200) {
          setPoints(data.data);

          // 計算有效點數總計
          const totalPoints = data.data
            .filter((p) => p.category === "ADD")
            .reduce((sum, p) => sum + (p.remainPoints || 0), 0);
          setTotal(totalPoints);

          // 找出最近到期日
          const expiryDates = data.data
            .filter((p) => p.expiredAt)
            .map((p) => new Date(p.expiredAt))
            .sort((a, b) => a - b);
          if (expiryDates.length > 0) {
            setNearestExpiry(expiryDates[0].toLocaleDateString());
          }
        } else {
          alert("取得點數資料失敗：" + data.message);
        }
      } catch (err) {
        console.error(err);
        alert("伺服器錯誤");
      }
    };

    fetchPoints();
  }, []);

  return (
    <div>
      <Navbar />
      <div>
        <h2>點數明細</h2>
        <p>有效點數總計：{total}</p>
        <p>點數即將到期日：{nearestExpiry}</p>
        <table border="1" cellPadding="5" style={{ marginTop: "10px", width: "100%" }}>
          <thead>
            <tr>
              <th>紀錄編號</th>
              <th>點數項目</th>
              <th>點數種類</th>
              <th>原派發點數</th>
              <th>剩餘點數</th>
              <th>扣除點數</th>
              <th>建立時間</th>
              <th>到期時間</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.logId}>
                <td>{p.logId}</td>
                <td>{p.typeName}</td>
                <td>{p.category === "ADD" ? "派發" : "消耗"}</td>
                <td>{p.category === "ADD" ? p.originalPoints : "-"}</td>
                <td>{p.category === "ADD" ? p.remainPoints ?? "-" : "-"}</td>
                <td>{p.category === "CONSUME" ? p.originalPoints : "-"}</td>
                <td>{p.createdAt?.replace("T", " ").slice(0, 10)}</td>
                <td>{p.expiredAt ? p.expiredAt.slice(0, 10) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MemberPointListPage;