import { View, Pressable, StyleSheet } from "react-native";
import { SPCard, SPText } from "../ui";
import { useAppTheme } from "../../theme/ThemeContext";
import { SPIcon } from "../icons/SPIcon";
import { borders, colors, fonts, radii, spacing } from "../../theme";
import { formatVolume } from "./ProgressComponents";

export interface WeeklyVolumeDay {
  label: string;
  kg: number;
}

export interface WeeklyVolumeData {
  totalKg: number;
  setsCompleted: number;
  durationMinutes: number;
  vsLastWeekPct: number | null;
  days: WeeklyVolumeDay[];
}

export function WeeklyVolumeCard({
  data,
  onViewAll,
}: {
  data: WeeklyVolumeData;
  onViewAll?: () => void;
}) {
  const { theme, isDark } = useAppTheme();
  const accentColor = isDark ? theme.accent : "#5C8A00";

  const maxKg = Math.max(...data.days.map((d) => d.kg), 1);
  const peakIndex = data.days.reduce(
    (best, d, i) => (d.kg > data.days[best].kg ? i : best),
    0,
  );

  const trend = data.vsLastWeekPct;
  const trendPositive = (trend ?? 0) >= 0;
  const trendColor =
    trend == null ? theme.muted : trendPositive ? accentColor : colors.danger;

  const hours = Math.floor(data.durationMinutes / 60);
  const mins = data.durationMinutes % 60;
  const durationLabel =
    hours > 0 ? `${hours}h ${mins.toString().padStart(2, "0")}m` : `${mins}m`;

  return (
    <SPCard style={wvStyles.card}>
      {/* Header */}
      <View style={wvStyles.headerRow}>
        <SPText
          variant="label"
          style={{
            fontSize: 12,
            letterSpacing: 1.2,
            fontFamily: fonts.brandBold,
            opacity: 0.55,
          }}
        >
          WEEKLY VOLUME
        </SPText>
        {onViewAll && (
          <Pressable onPress={onViewAll} hitSlop={8}>
            <SPText
              variant="caption"
              style={{
                fontSize: 12,
                fontFamily: fonts.brandBold,
                color: accentColor,
              }}
            >
              View all
            </SPText>
          </Pressable>
        )}
      </View>

      {/* Headline value */}
      <View style={wvStyles.headlineRow}>
        <View>
          <View
            style={{ flexDirection: "row", alignItems: "flex-end", gap: 6 }}
          >
            <SPText
              style={{
                fontSize: 32,
                lineHeight: 36,
                fontFamily: fonts.brandBold,
                letterSpacing: -0.5,
              }}
            >
              {data.totalKg.toLocaleString()}
            </SPText>
            <SPText
              variant="caption"
              style={{
                fontSize: 15,
                fontFamily: fonts.brandMedium,
                opacity: 0.5,
                marginBottom: 4,
              }}
            >
              kg
            </SPText>
          </View>
          <SPText
            variant="caption"
            style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}
          >
            This Week
          </SPText>
        </View>

        {trend !== null && (
          <View
            style={[
              wvStyles.trendPill,
              {
                backgroundColor: trendColor + "1A",
                borderColor: trendColor + "40",
              },
            ]}
          >
            <SPIcon
              name="trending"
              size={11}
              color={trendColor}
              style={{ transform: [{ scaleY: trendPositive ? 1 : -1 }] }}
            />
            <SPText
              variant="caption"
              style={{
                fontSize: 12,
                fontFamily: fonts.brandBold,
                color: trendColor,
              }}
            >
              {trendPositive ? "+" : ""}
              {trend}%
            </SPText>
          </View>
        )}
      </View>

      {/* Bar chart */}
      <View style={wvStyles.chartArea}>
        {data.days.map((d, i) => {
          const isPeak = i === peakIndex;
          const heightPct = Math.max((d.kg / maxKg) * 100, 6);

          return (
            <View key={d.label + i} style={wvStyles.barColumn}>
              {isPeak && (
                <View
                  style={[
                    wvStyles.tooltip,
                    {
                      backgroundColor: theme.raised,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <SPText
                    variant="caption"
                    style={{ fontSize: 11, fontFamily: fonts.brandBold }}
                  >
                    {formatVolume(d.kg)}
                  </SPText>
                  <View
                    style={[
                      wvStyles.tooltipArrow,
                      { borderTopColor: theme.raised },
                    ]}
                  />
                </View>
              )}
              <View style={wvStyles.barTrack}>
                <View
                  style={[
                    wvStyles.bar,
                    {
                      height: `${heightPct}%`,
                      backgroundColor: isPeak ? accentColor : theme.border,
                    },
                  ]}
                />
              </View>
              <SPText
                variant="caption"
                style={{
                  fontSize: 11,
                  marginTop: spacing[2],
                  fontFamily: fonts.brandMedium,
                  color: isPeak ? accentColor : theme.muted,
                  opacity: isPeak ? 1 : 0.6,
                }}
              >
                {d.label}
              </SPText>
            </View>
          );
        })}
      </View>

      {/* Supporting metrics */}
      <View style={wvStyles.metricsRow}>
        <View style={wvStyles.metric}>
          <SPIcon name="training" size={14} color={theme.muted} />
          <View>
            <SPText
              variant="h2"
              style={{ fontSize: 15, fontFamily: fonts.brandBold }}
            >
              {data.setsCompleted}
            </SPText>
            <SPText variant="caption" style={{ fontSize: 11, opacity: 0.5 }}>
              Sets Completed
            </SPText>
          </View>
        </View>

        <View
          style={[wvStyles.metricDivider, { backgroundColor: theme.border }]}
        />

        <View style={wvStyles.metric}>
          <SPIcon name="time" size={14} color={theme.muted} />
          <View>
            <SPText
              variant="h2"
              style={{ fontSize: 15, fontFamily: fonts.brandBold }}
            >
              {durationLabel}
            </SPText>
            <SPText variant="caption" style={{ fontSize: 11, opacity: 0.5 }}>
              Training Time
            </SPText>
          </View>
        </View>

        <View
          style={[wvStyles.metricDivider, { backgroundColor: theme.border }]}
        />

        <View style={wvStyles.metric}>
          <SPIcon name="dumbbell" size={14} color={theme.muted} />
          <View>
            <SPText
              variant="h2"
              style={{ fontSize: 15, fontFamily: fonts.brandBold }}
            >
              {Math.round(data.totalKg / 7).toLocaleString()}
            </SPText>
            <SPText variant="caption" style={{ fontSize: 11, opacity: 0.5 }}>
              Avg kg / Day
            </SPText>
          </View>
        </View>
      </View>
    </SPCard>
  );
}

const wvStyles = StyleSheet.create({
  card: {
    padding: spacing[4],
    gap: spacing[4],
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headlineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  trendPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radii.full,
    borderWidth: borders.thin,
  },
  chartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 110,
    paddingTop: spacing[6],
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  barTrack: {
    width: "55%",
    height: 64,
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: radii.sm,
    minHeight: 4,
  },
  tooltip: {
    position: "absolute",
    top: -6,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radii.md,
    borderWidth: borders.thin,
    alignItems: "center",
    zIndex: 2,
  },
  tooltipArrow: {
    position: "absolute",
    bottom: -5,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  metric: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  metricDivider: {
    width: 1,
    height: 28,
  },
});
