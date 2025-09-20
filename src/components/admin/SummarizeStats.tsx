import React from "react";
import { Users, Flame, Calendar, UserPlus, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart } from "@mui/x-charts/LineChart";

const SummarizeStats: React.FC = () => {
  // Sample data for the chart
  const caloriesData = [
    500000, 750000, 1200000, 900000, 1500000, 1800000, 2100000, 1900000, 2163576, 2000000, 1750000,
    1600000, 1400000, 1200000, 1100000, 1300000, 1500000, 1700000, 1900000, 1800000, 1600000,
    1400000, 1200000, 1000000, 800000, 600000, 700000, 900000, 1100000, 1300000, 1500000, 1700000,
    1900000, 2000000, 2100000,
  ];

  const xAxisData = caloriesData.map((_, index) => index * 100 + 300);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #E2F043 0%, #05644C 100%)",
        minHeight: "100vh",
        padding: "24px",
        color: "#076553",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
        gridTemplateRows: "auto auto auto auto 2fr",
        gap: "20px",
        gridAutoFlow: "row",
        gridTemplateAreas: `
          "Welcome Welcome Card1 Card1 Card2 Card2"
          ". DashBoard Card1 Card1 Card2 Card2"
          "Card3 Card3 Card4 Card4 Card5 Card5"
          "Card3 Card3 Card4 Card4 Card5 Card5"
          "Chart Chart Chart Chart Chart Chart"
        `,
      }}
    >
      {/* Welcome Text */}
      <div
        style={{
          gridArea: "Welcome",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            fontWeight: "300",
            margin: "0",
            color: "#076553",
            fontFamily: "Pacifico, cursive",
          }}
        >
          Welcome back
        </h1>
      </div>

      {/* Dashboard Text */}
      <div
        style={{
          gridArea: "DashBoard",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "500",
            margin: "0",
            fontStyle: "bold",
            color: "#076553",
          }}
        >
          Dashboard
        </h2>
      </div>

      {/* Active Users Today */}
      <div
        style={{
          gridArea: "Card1",
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: "14px", color: "#666", margin: "0 0 8px 0" }}>
              Active Users Today
            </p>
            <p
              style={{ fontSize: "28px", fontWeight: "700", margin: "0 0 8px 0", color: "#076553" }}
            >
              3,248
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <TrendingUp size={16} color="#10B981" />
              <span style={{ fontSize: "12px", color: "#10B981" }}>12.5% Up from yesterday</span>
            </div>
          </div>
          <Users size={24} color="#076553" />
        </div>
      </div>

      {/* Calories Burned Today */}
      <div
        style={{
          gridArea: "Card2",
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: "14px", color: "#666", margin: "0 0 8px 0" }}>
              Calories Burned Today
            </p>
            <p
              style={{ fontSize: "28px", fontWeight: "700", margin: "0 0 8px 0", color: "#076553" }}
            >
              1,480,000
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <TrendingUp size={16} color="#EF4444" />
              <span style={{ fontSize: "12px", color: "#EF4444" }}>3.1% Up from yesterday</span>
            </div>
          </div>
          <Flame size={24} color="#FFA500" />
        </div>
      </div>

      {/* Ongoing Events */}
      <div
        style={{
          gridArea: "Card3",
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: "14px", color: "#666", margin: "0 0 8px 0" }}>Ongoing Events</p>
            <p
              style={{ fontSize: "28px", fontWeight: "700", margin: "0 0 8px 0", color: "#076553" }}
            >
              5
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <TrendingUp size={16} color="#10B981" />
              <span style={{ fontSize: "12px", color: "#10B981" }}>1 new today</span>
            </div>
          </div>
          <Calendar size={24} color="#10B981" />
        </div>
      </div>

      {/* New Users This Week */}
      <div
        style={{
          gridArea: "Card4",
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: "14px", color: "#666", margin: "0 0 8px 0" }}>
              New Users This Week
            </p>
            <p
              style={{ fontSize: "28px", fontWeight: "700", margin: "0 0 8px 0", color: "#076553" }}
            >
              720
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <TrendingUp size={16} color="#10B981" />
              <span style={{ fontSize: "12px", color: "#10B981" }}>8.7% Up from last week</span>
            </div>
          </div>
          <UserPlus size={24} color="#FFA500" />
        </div>
      </div>

      {/* Challenges Completed */}
      <div
        style={{
          gridArea: "Card5",
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: "14px", color: "#666", margin: "0 0 8px 0" }}>
              Challenges Completed
            </p>
            <p
              style={{ fontSize: "28px", fontWeight: "700", margin: "0 0 8px 0", color: "#076553" }}
            >
              9,730
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <TrendingUp size={16} color="#10B981" />
              <span style={{ fontSize: "12px", color: "#10B981" }}>5.6% Up from yesterday</span>
            </div>
          </div>
          <Trophy size={24} color="#FFA500" />
        </div>
      </div>

      {/* Chart Section */}
      <div
        style={{
          gridArea: "Chart",
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "600",
              margin: "0",
              color: "#076553",
            }}
          >
            Calories Burned Details
          </h3>
          <div
            style={{
              backgroundColor: "#F3F4F6",
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "14px",
              color: "#076553",
            }}
          >
            January → July
          </div>
        </div>

        <div style={{ height: "400px", width: "100%" }}>
          <LineChart
            xAxis={[
              {
                data: xAxisData,
                scaleType: "linear",
                label: "Time",
              },
            ]}
            series={[
              {
                data: caloriesData,
                color: "rgba(59, 130, 246, 0.3)",
                area: true,
                curve: "linear",
              },
            ]}
            yAxis={[
              {
                label: "Calories Burned",
                min: 500000,
                max: 2500000,
              },
            ]}
            grid={{ horizontal: true }}
            height={420}
            sx={{
              "& .MuiChartsAxis-root": {
                "& .MuiChartsAxis-tick": {
                  fill: "#076553",
                },
                "& .MuiChartsAxis-label": {
                  fill: "#076553",
                },
              },
              "& .MuiChartsGrid-root": {
                stroke: "#E5E7EB",
              },
              "& .MuiAreaElement-root": {
                fill: "rgba(59, 130, 246, 0.2)",
              },
              "& .MuiLineElement-root": {
                stroke: "rgba(59, 130, 246, 0.8)",
                strokeWidth: 1,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SummarizeStats;
