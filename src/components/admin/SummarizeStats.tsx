import React, { useEffect, useMemo, useState } from "react";
import { Users, Calendar, Trophy, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { LineChart } from "@mui/x-charts/LineChart";
import { challengeService } from "@/services/challengeService";
import { authService } from "@/services/authService";
import { billingService } from "@/services/billingService";
import { getAiUsageSummary } from "@/services/billingAnalyticsService";
import type { AiUsageDailyPoint } from "@/services/billingAnalyticsService";
import type { Challenge } from "@/models/challenge";
import type { UserModel } from "@/models";
import type { InvoiceResponse } from "@/models/billing";

interface MonthlyMetrics {
  monthKey: string;
  label: string;
  completedChallenges: number;
  newUsers: number;
  revenue: number;
}

interface DailyPerformancePoint {
  label: string;
  completedChallenges: number;
  newUsers: number;
  revenue: number;
  revenueScaled: number;
}

interface DeltaInfo {
  direction: "up" | "down" | "neutral";
  percent: number;
  absolute: number;
}

const MONTH_WINDOW = 6;

const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getMonthKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const getMonthLabel = (date: Date): string =>
  date.toLocaleDateString("vi-VN", { month: "short", year: "numeric" });

const isChallengeCompleted = (challenge: Challenge): boolean => {
  const status = challenge.status?.toLowerCase();
  if (status === "completed" || status === "finished" || status === "ended") {
    return true;
  }

  const endDate = parseDate(challenge.endAt);
  return !!endDate && endDate.getTime() <= Date.now();
};

const calculateDelta = (currentValue: number, previousValue: number): DeltaInfo => {
  if (!Number.isFinite(currentValue) || !Number.isFinite(previousValue)) {
    return { direction: "neutral", absolute: 0, percent: 0 };
  }

  const absolute = currentValue - previousValue;
  if (absolute === 0) {
    return { direction: "neutral", absolute: 0, percent: 0 };
  }

  const percent =
    previousValue === 0
      ? 100
      : Math.round((Math.abs(absolute) / Math.max(previousValue, 1)) * 1000) / 10;

  return { direction: absolute > 0 ? "up" : "down", absolute, percent };
};

const formatNumber = (value: number): string => new Intl.NumberFormat("vi-VN").format(value);
const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const REVENUE_CHART_SCALE = 1_000_000;
const MAX_AI_USAGE_FILL_DAYS = 45;
type AiUsageRow = AiUsageDailyPoint & { dateLabel: string };

const SummarizeStats: React.FC = () => {
  const [monthlyStats, setMonthlyStats] = useState<MonthlyMetrics[]>([]);
  const [recentCompletedChallenges, setRecentCompletedChallenges] = useState<Challenge[]>([]);
  const [dailyPerformanceDataset, setDailyPerformanceDataset] = useState<DailyPerformancePoint[]>(
    []
  );
  const [performanceMonthLabel, setPerformanceMonthLabel] = useState<string>("");
  const [aiUsageRows, setAiUsageRows] = useState<AiUsageRow[]>([]);
  const [aiUsageRangeLabel, setAiUsageRangeLabel] = useState<string>("");
  const [totalAiTokens, setTotalAiTokens] = useState<number>(0);
  const [totalAiCost, setTotalAiCost] = useState<number>(0);
  const [previousAiTokens, setPreviousAiTokens] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startDateIso = startOfMonth.toISOString().split("T")[0];
        const endDateIso = today.toISOString().split("T")[0];

        const previousMonthEnd = new Date(startOfMonth);
        previousMonthEnd.setDate(0);
        const previousMonthStart = new Date(
          previousMonthEnd.getFullYear(),
          previousMonthEnd.getMonth(),
          1
        );
        const previousStartIso = previousMonthStart.toISOString().split("T")[0];
        const previousEndIso = previousMonthEnd.toISOString().split("T")[0];

        const [challenges, users, invoices, aiUsageSummary, previousAiUsage] = await Promise.all([
          challengeService.getAllChallenges(),
          authService.getUsers(),
          billingService.listUserInvoices().catch((invoiceError) => {
            console.warn("Unable to load invoice data:", invoiceError);
            return [];
          }),
          getAiUsageSummary({ startDate: startDateIso, endDate: endDateIso }).catch(
            (usageError: unknown) => {
              console.warn("Unable to load AI usage:", usageError);
              return null;
            }
          ),
          getAiUsageSummary({ startDate: previousStartIso, endDate: previousEndIso }).catch(
            (usageError: unknown) => {
              console.warn("Unable to load previous AI usage:", usageError);
              return null;
            }
          ),
        ]);

        if (!isMounted) return;

        const completedChallenges = challenges
          .filter(isChallengeCompleted)
          .sort((a: Challenge, b: Challenge) => {
            const dateA = parseDate(a.endAt || a.updatedAt || a.createdAt)?.getTime() ?? 0;
            const dateB = parseDate(b.endAt || b.updatedAt || b.createdAt)?.getTime() ?? 0;
            return dateB - dateA;
          });

        setRecentCompletedChallenges(completedChallenges.slice(0, 5));

        const metricsMap = new Map<string, MonthlyMetrics>();
        const revenueByMonthByDay = new Map<string, Map<string, number>>();
        const completionsByMonthByDay = new Map<string, Map<string, number>>();
        const usersByMonthByDay = new Map<string, Map<string, number>>();

        const ensureMonthEntry = (date: Date | null): MonthlyMetrics | null => {
          if (!date) return null;
          const bucketDate = new Date(date.getFullYear(), date.getMonth(), 1);
          const bucketKey = getMonthKey(bucketDate);

          if (!metricsMap.has(bucketKey)) {
            metricsMap.set(bucketKey, {
              monthKey: bucketKey,
              label: getMonthLabel(bucketDate),
              completedChallenges: 0,
              newUsers: 0,
              revenue: 0,
            });
          }

          return metricsMap.get(bucketKey)!;
        };

        completedChallenges.forEach((challenge: Challenge) => {
          const completionDate = parseDate(
            challenge.endAt || challenge.updatedAt || challenge.createdAt
          );
          const bucket = ensureMonthEntry(completionDate);
          if (!completionDate || !bucket) {
            return;
          }

          bucket.completedChallenges += 1;

          const monthDate = new Date(completionDate.getFullYear(), completionDate.getMonth(), 1);
          const monthKey = getMonthKey(monthDate);
          if (!completionsByMonthByDay.has(monthKey)) {
            completionsByMonthByDay.set(monthKey, new Map());
          }
          const dayKey = completionDate.toISOString().split("T")[0];
          const monthMap = completionsByMonthByDay.get(monthKey)!;
          monthMap.set(dayKey, (monthMap.get(dayKey) ?? 0) + 1);
        });

        users.forEach((user: UserModel) => {
          const createdDate = parseDate(user.createdAt);
          const bucket = ensureMonthEntry(createdDate);
          if (!createdDate || !bucket) {
            return;
          }

          bucket.newUsers += 1;

          const monthDate = new Date(createdDate.getFullYear(), createdDate.getMonth(), 1);
          const monthKey = getMonthKey(monthDate);
          if (!usersByMonthByDay.has(monthKey)) {
            usersByMonthByDay.set(monthKey, new Map());
          }
          const dayKey = createdDate.toISOString().split("T")[0];
          const monthMap = usersByMonthByDay.get(monthKey)!;
          monthMap.set(dayKey, (monthMap.get(dayKey) ?? 0) + 1);
        });

        (invoices as InvoiceResponse[]).forEach((invoice) => {
          const status = invoice.status?.toLowerCase();
          if (status !== "paid" && status !== "completed") {
            return;
          }

          const paidDate = parseDate(invoice.paidAt || invoice.updatedAt || invoice.createdAt);
          const bucket = ensureMonthEntry(paidDate);
          if (!paidDate || !bucket) {
            return;
          }

          bucket.revenue += invoice.amount || 0;

          const monthDate = new Date(paidDate.getFullYear(), paidDate.getMonth(), 1);
          const monthKey = getMonthKey(monthDate);
          if (!revenueByMonthByDay.has(monthKey)) {
            revenueByMonthByDay.set(monthKey, new Map());
          }

          const dayKey = paidDate.toISOString().split("T")[0];
          const monthMap = revenueByMonthByDay.get(monthKey)!;
          monthMap.set(dayKey, (monthMap.get(dayKey) ?? 0) + (invoice.amount || 0));
        });

        const sortedMetrics = Array.from(metricsMap.values()).sort(
          (a: MonthlyMetrics, b: MonthlyMetrics) => a.monthKey.localeCompare(b.monthKey)
        );
        const limitedMetrics = sortedMetrics.slice(-MONTH_WINDOW);

        setMonthlyStats(limitedMetrics);

        if (limitedMetrics.length > 0) {
          const latestMonth = limitedMetrics[limitedMetrics.length - 1];
          const monthKey = latestMonth.monthKey;
          const completionMap = completionsByMonthByDay.get(monthKey) ?? new Map();
          const userMap = usersByMonthByDay.get(monthKey) ?? new Map();
          const revenueMap = revenueByMonthByDay.get(monthKey) ?? new Map();

          const dayKeys = Array.from(
            new Set<string>([...completionMap.keys(), ...userMap.keys(), ...revenueMap.keys()])
          ).sort((a: string, b: string) => a.localeCompare(b));

          const dailyDataset: DailyPerformancePoint[] = dayKeys.map((dayKey: string) => {
            const revenueValue = revenueMap.get(dayKey) ?? 0;
            return {
              label: new Date(dayKey).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "short",
              }),
              completedChallenges: completionMap.get(dayKey) ?? 0,
              newUsers: userMap.get(dayKey) ?? 0,
              revenue: revenueValue,
              revenueScaled: revenueValue / REVENUE_CHART_SCALE,
            };
          });

          setDailyPerformanceDataset(dailyDataset);
          setPerformanceMonthLabel(latestMonth.label);
        } else {
          setDailyPerformanceDataset([]);
          setPerformanceMonthLabel("");
        }

        if (aiUsageSummary) {
          console.log("AI usage summary:", aiUsageSummary);
          const usageStart = new Date(`${aiUsageSummary.startDate}T00:00:00Z`);
          const usageEnd = new Date(`${aiUsageSummary.endDate}T00:00:00Z`);
          const dailyMap = new Map<string, AiUsageDailyPoint>();

          aiUsageSummary.daily.forEach((point: AiUsageDailyPoint) => {
            dailyMap.set(point.date, point);
          });

          const normalizedRows: AiUsageRow[] = [];
          const hasValidRange =
            !Number.isNaN(usageStart.getTime()) &&
            !Number.isNaN(usageEnd.getTime()) &&
            usageStart <= usageEnd;

          const daysInRange = hasValidRange
            ? Math.floor((usageEnd.getTime() - usageStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
            : 0;
          const shouldFillMissingDays =
            hasValidRange && daysInRange > 0 && daysInRange <= MAX_AI_USAGE_FILL_DAYS;

          if (shouldFillMissingDays) {
            const cursor = new Date(usageStart);

            while (cursor <= usageEnd) {
              const isoKey = cursor.toISOString().split("T")[0];
              const point = dailyMap.get(isoKey) ?? { date: isoKey, tokens: 0, cost: 0 };

              normalizedRows.push({
                ...point,
                tokens: point.tokens ?? 0,
                cost: point.cost ?? 0,
                dateLabel: cursor.toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "short",
                }),
              });

              cursor.setDate(cursor.getDate() + 1);
            }
          } else {
            aiUsageSummary.daily
              .sort((a, b) => a.date.localeCompare(b.date))
              .forEach((point: AiUsageDailyPoint) => {
                normalizedRows.push({
                  ...point,
                  tokens: point.tokens ?? 0,
                  cost: point.cost ?? 0,
                  dateLabel: new Date(`${point.date}T00:00:00Z`).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "short",
                  }),
                });
              });
          }

          setAiUsageRows(normalizedRows);
          setTotalAiTokens(aiUsageSummary.totalTokens);
          setTotalAiCost(aiUsageSummary.totalCost);

          const rangeLabel = `${new Date(
            `${aiUsageSummary.startDate}T00:00:00Z`
          ).toLocaleDateString("vi-VN", { day: "2-digit", month: "short" })} - ${new Date(
            `${aiUsageSummary.endDate}T00:00:00Z`
          ).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "short",
          })}`;
          setAiUsageRangeLabel(rangeLabel);
        } else {
          setAiUsageRows([]);
          setTotalAiTokens(0);
          setTotalAiCost(0);
          setAiUsageRangeLabel("");
        }

        setPreviousAiTokens(previousAiUsage?.totalTokens ?? 0);
      } catch (fetchError) {
        console.error("Unable to load summary data:", fetchError);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load summary data. Please try again."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentMonthStat = monthlyStats[monthlyStats.length - 1] || null;
  const previousMonthStat = monthlyStats[monthlyStats.length - 2] || null;

  const statsCards = useMemo(() => {
    const cards = [
      {
        id: "completedChallenges",
        title: "Completed challenges",
        value: currentMonthStat?.completedChallenges ?? 0,
        previous: previousMonthStat?.completedChallenges ?? 0,
        icon: <Trophy size={24} color="#FFA500" />,
        formatter: formatNumber,
        subtitle: currentMonthStat?.label ? `Month ${currentMonthStat.label}` : "",
      },
      {
        id: "newUsers",
        title: "New users",
        value: currentMonthStat?.newUsers ?? 0,
        previous: previousMonthStat?.newUsers ?? 0,
        icon: <Users size={24} color="#076553" />,
        formatter: formatNumber,
        subtitle: "vs previous month",
      },
      {
        id: "revenue",
        title: "Revenue",
        value: currentMonthStat?.revenue ?? 0,
        previous: previousMonthStat?.revenue ?? 0,
        icon: <Wallet size={24} color="#10B981" />,
        formatter: formatCurrency,
        subtitle: "Collected this month",
      },
    ];

    return cards.map((card) => ({
      ...card,
      delta: calculateDelta(card.value, card.previous),
    }));
  }, [currentMonthStat, previousMonthStat]);

  const chartDataset = useMemo(() => dailyPerformanceDataset, [dailyPerformanceDataset]);
  const aiUsageLineDataset = useMemo(
    () =>
      aiUsageRows.map((row) => ({
        label: row.dateLabel,
        tokens: row.tokens,
      })),
    [aiUsageRows]
  );

  const chartRangeLabel = performanceMonthLabel
    ? `Daily view - ${performanceMonthLabel}`
    : "No data yet";
  const estimatedProfit = (currentMonthStat?.revenue ?? 0) - totalAiCost;
  const aiTokenDelta = useMemo(
    () => calculateDelta(totalAiTokens, previousAiTokens),
    [previousAiTokens, totalAiTokens]
  );

  const renderDelta = (delta: DeltaInfo) => {
    if (delta.direction === "neutral" || delta.percent === 0) {
      return (
        <span style={{ fontSize: "12px", color: "#6B7280" }}>No change vs previous month</span>
      );
    }

    const Icon = delta.direction === "up" ? TrendingUp : TrendingDown;
    const color = delta.direction === "up" ? "#10B981" : "#EF4444";

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <Icon size={16} color={color} />
        <span style={{ fontSize: "12px", color }}>
          {delta.direction === "up" ? "+" : "-"}
          {delta.percent}% vs previous month
        </span>
      </div>
    );
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #E2F043 0%, #05644C 100%)",
        minHeight: "100vh",
      }}
    >
      {error && (
        <div
          style={{
            margin: "0 24px 12px",
            padding: "12px 16px",
            borderRadius: "8px",
            backgroundColor: "#FDE68A",
            color: "#92400E",
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          padding: "24px",
          color: "#076553",
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
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
        <div style={{ gridArea: "Welcome", display: "flex", alignItems: "center" }}>
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
        <div style={{ gridArea: "DashBoard", display: "flex", alignItems: "center" }}>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "500",
              margin: "0",
              color: "#076553",
            }}
          >
            Dashboard
          </h2>
        </div>

        {/* Stat Cards */}
        {statsCards.map((card, index) => (
          <div
            key={card.id}
            style={{
              gridArea: index === 0 ? "Card1" : index === 1 ? "Card2" : "Card5",
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              position: "relative",
            }}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
            >
              <div>
                <p style={{ fontSize: "14px", color: "#666", margin: "0 0 8px 0" }}>{card.title}</p>
                <p
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    margin: "0 0 8px 0",
                    color: "#076553",
                  }}
                >
                  {loading ? "..." : card.formatter(card.value)}
                </p>
                {loading ? (
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>Loading data...</span>
                ) : (
                  renderDelta(card.delta)
                )}
                {card.subtitle && (
                  <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "8px" }}>
                    {card.subtitle}
                  </p>
                )}
              </div>
              {card.icon}
            </div>
          </div>
        ))}

        {/* Completed Challenges List */}
        <div
          style={{
            gridArea: "Card3",
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "14px", color: "#666", margin: "0" }}>Completed challenges</p>
              <h3 style={{ margin: 0, fontSize: "22px", color: "#076553" }}>
                {loading ? "..." : formatNumber(recentCompletedChallenges.length)}
              </h3>
            </div>
            <Calendar size={24} color="#10B981" />
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{ color: "#6B7280" }}>Loading list...</div>
            ) : recentCompletedChallenges.length === 0 ? (
              <div style={{ color: "#6B7280" }}>No completed challenges yet.</div>
            ) : (
              recentCompletedChallenges.map((challenge) => {
                const completedAt =
                  parseDate(
                    challenge.endAt || challenge.updatedAt || challenge.createdAt
                  )?.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }) || "Unknown";

                return (
                  <div
                    key={challenge.id}
                    style={{
                      padding: "12px 0",
                      borderBottom: "1px solid #E5E7EB",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "#111827" }}>{challenge.title}</span>
                    <span style={{ fontSize: "12px", color: "#6B7280" }}>
                      Finished: {completedAt}
                    </span>
                    {challenge.prizePool ? (
                      <span style={{ fontSize: "12px", color: "#10B981" }}>
                        Prize Pool: {formatCurrency(challenge.prizePool)}
                      </span>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* New Users Card (detailed) */}
        <div
          style={{
            gridArea: "Card4",
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
          >
            <div>
              <p style={{ fontSize: "14px", color: "#666", margin: "0 0 8px 0" }}>AI tokens used</p>
              <p style={{ fontSize: "34px", fontWeight: "700", margin: "0", color: "#076553" }}>
                {loading ? "..." : formatNumber(totalAiTokens)}
              </p>
              <span style={{ fontSize: "12px", color: "#6B7280" }}>Current month</span>
            </div>
            <TrendingUp size={28} color="#0ea5e9" />
          </div>
          {!loading && renderDelta(aiTokenDelta)}
          <span style={{ fontSize: "12px", color: "#6B7280" }}>Compared to previous month</span>
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
            <h3 style={{ fontSize: "20px", fontWeight: "600", margin: "0", color: "#076553" }}>
              Monthly performance
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
              {chartRangeLabel}
            </div>
          </div>

          {chartDataset.length === 0 ? (
            <div style={{ textAlign: "center", color: "#6B7280", padding: "80px 0" }}>
              No data available.
            </div>
          ) : (
            <div style={{ height: "400px", width: "100%" }}>
              <LineChart
                dataset={chartDataset as readonly Record<string, any>[]}
                xAxis={[
                  {
                    scaleType: "point",
                    dataKey: "label",
                  },
                ]}
                series={[
                  {
                    dataKey: "completedChallenges",
                    label: "Completed challenges",
                    color: "rgba(59, 130, 246, 0.8)",
                    area: true,
                  },
                  {
                    dataKey: "newUsers",
                    label: "New users",
                    color: "rgba(16, 185, 129, 0.8)",
                  },
                  {
                    dataKey: "revenueScaled",
                    label: "Revenue (VND)",
                    color: "rgba(249, 115, 22, 0.9)",
                    valueFormatter: (value?: number | null) =>
                      value != null ? formatCurrency(value * REVENUE_CHART_SCALE) : "",
                  },
                ]}
                height={420}
                grid={{ horizontal: true }}
                sx={{
                  "& .MuiChartsAxis-root": {
                    "& .MuiChartsAxis-tick": { fill: "#076553" },
                    "& .MuiChartsAxis-label": { fill: "#076553" },
                  },
                  "& .MuiChartsGrid-root": { stroke: "#E5E7EB" },
                }}
              />
            </div>
          )}
          <div style={{ marginTop: "32px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h4 style={{ margin: 0, color: "#076553" }}>AI token usage</h4>
              {aiUsageRangeLabel ? (
                <div
                  style={{
                    backgroundColor: "#F3F4F6",
                    padding: "6px 10px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    color: "#374151",
                  }}
                >
                  {aiUsageRangeLabel}
                </div>
              ) : null}
            </div>
            {aiUsageLineDataset.length === 0 ? (
              <div
                style={{
                  height: "200px",
                  backgroundColor: "#F9FAFB",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6B7280",
                }}
              >
                No AI token usage recorded for this range.
              </div>
            ) : (
              <div style={{ height: "320px", width: "100%" }}>
                <LineChart
                  dataset={aiUsageLineDataset as readonly Record<string, any>[]}
                  xAxis={[
                    {
                      scaleType: "point",
                      dataKey: "label",
                    },
                  ]}
                  yAxis={[
                    {
                      label: "Tokens",
                    },
                  ]}
                  series={[
                    {
                      dataKey: "tokens",
                      label: "Tokens per day",
                      color: "rgba(59, 130, 246, 0.85)",
                      valueFormatter: (value?: number | null) =>
                        value != null ? formatNumber(value) : "",
                      showMark: false,
                      curve: "monotoneX",
                    },
                  ]}
                  height={320}
                  grid={{ horizontal: true }}
                  sx={{
                    "& .MuiChartsAxis-root": {
                      "& .MuiChartsAxis-tick": { fill: "#076553" },
                      "& .MuiChartsAxis-label": { fill: "#076553" },
                    },
                    "& .MuiChartsGrid-root": { stroke: "#E5E7EB" },
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummarizeStats;
