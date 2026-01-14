import { Suspense } from "react";
import DashboardContent from "./DashboardContent";

function DashboardLoading() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #581c87, #1e3a8a, #030712)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff"
    }}>
      Loading...
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
