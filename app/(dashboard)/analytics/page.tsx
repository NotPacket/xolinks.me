"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AnalyticsData {
  summary: {
    totalViews: number;
    totalClicks: number;
    clickRate: string;
  };
  chartData: { date: string; views: number; clicks: number }[];
  linkStats: { linkId: string; title: string; clicks: number; platform: string | null }[];
  deviceStats: { device: string; count: number }[];
  browserStats: { browser: string; count: number }[];
}

const cardStyle = {
  backgroundColor: "rgba(17, 24, 39, 0.6)",
  border: "1px solid #374151",
  borderRadius: "16px",
  padding: "24px",
  marginBottom: "24px"
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/user/analytics?days=${days}`);
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch");
        }
        const analyticsData = await res.json();
        setData(analyticsData);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [days, router]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #581c87, #1e3a8a, #030712)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff"
      }}>
        Loading analytics...
      </div>
    );
  }

  const maxValue = Math.max(
    ...((data?.chartData || []).map((d) => Math.max(d.views, d.clicks))),
    1
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #581c87, #1e3a8a, #030712)",
      color: "#fff"
    }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid rgba(55, 65, 81, 0.5)",
        backgroundColor: "rgba(17, 24, 39, 0.5)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h1 style={{ fontSize: "20px", fontWeight: "bold" }}>Analytics</h1>
          <Link href="/dashboard" style={{ color: "#a855f7", textDecoration: "none", fontSize: "14px" }}>
            Dashboard
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Time Range Selector */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "32px" }}>
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "500",
                border: "none",
                cursor: "pointer",
                backgroundColor: days === d ? "#9333ea" : "rgba(31, 41, 55, 0.8)",
                color: days === d ? "#fff" : "#9ca3af",
                transition: "all 0.2s"
              }}
            >
              {d} days
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "32px"
        }}>
          <div style={cardStyle}>
            <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "8px" }}>Profile Views</p>
            <p style={{ fontSize: "36px", fontWeight: "bold" }}>{data?.summary.totalViews || 0}</p>
          </div>
          <div style={cardStyle}>
            <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "8px" }}>Link Clicks</p>
            <p style={{ fontSize: "36px", fontWeight: "bold" }}>{data?.summary.totalClicks || 0}</p>
          </div>
          <div style={cardStyle}>
            <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "8px" }}>Click Rate</p>
            <p style={{ fontSize: "36px", fontWeight: "bold" }}>{data?.summary.clickRate || 0}%</p>
          </div>
        </div>

        {/* Chart */}
        <div style={{ ...cardStyle, marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>Views & Clicks Over Time</h2>
          <div style={{ height: "250px", display: "flex", alignItems: "flex-end", gap: "4px" }}>
            {data?.chartData.slice(-30).map((day, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "2px", height: "200px", justifyContent: "flex-end" }}>
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: "rgba(168, 85, 247, 0.5)",
                      borderRadius: "4px 4px 0 0",
                      height: `${(day.views / maxValue) * 100}%`,
                      minHeight: day.views > 0 ? "4px" : "0"
                    }}
                    title={`${day.views} views`}
                  />
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: "rgba(59, 130, 246, 0.5)",
                      borderRadius: "4px 4px 0 0",
                      height: `${(day.clicks / maxValue) * 100}%`,
                      minHeight: day.clicks > 0 ? "4px" : "0"
                    }}
                    title={`${day.clicks} clicks`}
                  />
                </div>
                {i % 5 === 0 && (
                  <span style={{ fontSize: "10px", color: "#6b7280", transform: "rotate(-45deg)", whiteSpace: "nowrap" }}>
                    {new Date(day.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "24px", marginTop: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "12px", height: "12px", backgroundColor: "rgba(168, 85, 247, 0.5)", borderRadius: "4px" }} />
              <span style={{ fontSize: "14px", color: "#9ca3af" }}>Views</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "12px", height: "12px", backgroundColor: "rgba(59, 130, 246, 0.5)", borderRadius: "4px" }} />
              <span style={{ fontSize: "14px", color: "#9ca3af" }}>Clicks</span>
            </div>
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "32px"
        }}>
          {/* Top Links */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>Top Links</h2>
            {data?.linkStats.length === 0 ? (
              <p style={{ color: "#6b7280" }}>No clicks yet</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {data?.linkStats.slice(0, 5).map((link, i) => (
                  <div key={link.linkId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ color: "#6b7280", fontSize: "14px", width: "20px" }}>{i + 1}</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "200px" }}>{link.title}</span>
                    </div>
                    <span style={{ color: "#a855f7", fontWeight: "500" }}>{link.clicks}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Device & Browser Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={cardStyle}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>Devices</h2>
              {data?.deviceStats.length === 0 ? (
                <p style={{ color: "#6b7280" }}>No data yet</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {data?.deviceStats.map((d) => {
                    const total = data.deviceStats.reduce((sum, s) => sum + s.count, 0);
                    const percent = total > 0 ? (d.count / total) * 100 : 0;
                    return (
                      <div key={d.device}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "6px" }}>
                          <span style={{ color: "#d1d5db" }}>{d.device}</span>
                          <span style={{ color: "#9ca3af" }}>{percent.toFixed(0)}%</span>
                        </div>
                        <div style={{ height: "8px", backgroundColor: "#374151", borderRadius: "50px", overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              backgroundColor: "#a855f7",
                              borderRadius: "50px",
                              width: `${percent}%`,
                              transition: "width 0.3s"
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={cardStyle}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>Browsers</h2>
              {data?.browserStats.length === 0 ? (
                <p style={{ color: "#6b7280" }}>No data yet</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {data?.browserStats.slice(0, 5).map((b) => {
                    const total = data.browserStats.reduce((sum, s) => sum + s.count, 0);
                    const percent = total > 0 ? (b.count / total) * 100 : 0;
                    return (
                      <div key={b.browser}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "6px" }}>
                          <span style={{ color: "#d1d5db" }}>{b.browser}</span>
                          <span style={{ color: "#9ca3af" }}>{percent.toFixed(0)}%</span>
                        </div>
                        <div style={{ height: "8px", backgroundColor: "#374151", borderRadius: "50px", overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              backgroundColor: "#3b82f6",
                              borderRadius: "50px",
                              width: `${percent}%`,
                              transition: "width 0.3s"
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
