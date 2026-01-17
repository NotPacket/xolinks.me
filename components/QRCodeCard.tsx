"use client";

import { useState, useRef } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";

interface QRCodeCardProps {
  username: string;
  displayName?: string | null;
}

export default function QRCodeCard({ username, displayName }: QRCodeCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [qrColor, setQrColor] = useState("#a855f7");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState(200);
  const canvasRef = useRef<HTMLDivElement>(null);

  const profileUrl = `https://xolinks.me/@${username}`;

  const downloadQRCode = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `xolinks-${username}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copyProfileUrl = () => {
    navigator.clipboard.writeText(profileUrl);
  };

  const cardStyle = {
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    border: "1px solid #374151",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px"
  };

  return (
    <>
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "24px", flexWrap: "wrap" }}>
          <div style={{ flex: "1", minWidth: "200px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>Share Your Profile</h3>
            <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "16px" }}>
              Share your QR code or link to let others find your profile instantly.
            </p>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 16px",
              backgroundColor: "rgba(31, 41, 55, 0.5)",
              border: "1px solid #374151",
              borderRadius: "10px",
              marginBottom: "16px"
            }}>
              <span style={{ color: "#9ca3af", fontSize: "14px", flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                {profileUrl}
              </span>
              <button
                onClick={copyProfileUrl}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "rgba(168, 85, 247, 0.2)",
                  border: "1px solid rgba(168, 85, 247, 0.4)",
                  borderRadius: "6px",
                  color: "#a855f7",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
              >
                Copy
              </button>
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  padding: "12px 20px",
                  background: "linear-gradient(to right, #9333ea, #3b82f6)",
                  border: "none",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                View QR Code
              </button>
              <button
                onClick={downloadQRCode}
                style={{
                  padding: "12px 20px",
                  backgroundColor: "rgba(31, 41, 55, 0.5)",
                  border: "1px solid #374151",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download
              </button>
            </div>
          </div>

          <div style={{
            padding: "16px",
            backgroundColor: "#fff",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <QRCodeSVG
              value={profileUrl}
              size={120}
              bgColor="#ffffff"
              fgColor="#a855f7"
              level="M"
            />
          </div>
        </div>

        {/* Hidden canvas for download */}
        <div ref={canvasRef} style={{ position: "absolute", left: "-9999px" }}>
          <QRCodeCanvas
            value={profileUrl}
            size={size}
            bgColor={bgColor}
            fgColor={qrColor}
            level="H"
            includeMargin={true}
          />
        </div>
      </div>

      {/* QR Code Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "24px"
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: "#111827",
              borderRadius: "24px",
              padding: "32px",
              maxWidth: "480px",
              width: "100%",
              border: "1px solid #374151"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#fff" }}>Your QR Code</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  cursor: "pointer",
                  fontSize: "24px",
                  lineHeight: 1
                }}
              >
                &times;
              </button>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "center",
              padding: "32px",
              backgroundColor: bgColor,
              borderRadius: "16px",
              marginBottom: "24px"
            }}>
              <QRCodeSVG
                value={profileUrl}
                size={size}
                bgColor={bgColor}
                fgColor={qrColor}
                level="H"
                includeMargin={false}
              />
            </div>

            <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "14px", marginBottom: "24px" }}>
              Scan to visit <span style={{ color: "#a855f7" }}>@{username}</span>&apos;s profile
            </p>

            {/* Customization Options */}
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "500", color: "#d1d5db", marginBottom: "12px" }}>Customize</h4>

              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "120px" }}>
                  <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>
                    QR Color
                  </label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {["#a855f7", "#3b82f6", "#22c55e", "#f97316", "#ef4444", "#000000"].map((color) => (
                      <button
                        key={color}
                        onClick={() => setQrColor(color)}
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: color,
                          border: qrColor === color ? "3px solid #fff" : "none",
                          borderRadius: "6px",
                          cursor: "pointer"
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: "120px" }}>
                  <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>
                    Background
                  </label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {["#ffffff", "#f3f4f6", "#fef3c7", "#dbeafe", "#111827"].map((color) => (
                      <button
                        key={color}
                        onClick={() => setBgColor(color)}
                        style={{
                          width: "32px",
                          height: "32px",
                          backgroundColor: color,
                          border: bgColor === color ? "3px solid #a855f7" : "1px solid #374151",
                          borderRadius: "6px",
                          cursor: "pointer"
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>
                  Size: {size}px
                </label>
                <input
                  type="range"
                  min="150"
                  max="400"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  style={{ width: "100%", cursor: "pointer" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={downloadQRCode}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "linear-gradient(to right, #9333ea, #3b82f6)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PNG
              </button>
              <button
                onClick={copyProfileUrl}
                style={{
                  padding: "14px 20px",
                  backgroundColor: "rgba(31, 41, 55, 0.5)",
                  border: "1px solid #374151",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: "500",
                  cursor: "pointer"
                }}
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
