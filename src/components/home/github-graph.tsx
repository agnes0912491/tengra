"use client";

import { ActivityCalendar } from "react-activity-calendar";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@tengra/language";

const GITHUB_USERNAME = "agnes0912491";

interface ContributionDay {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
}

// Fetch contributions using github-contributions-api (public proxy)
async function fetchGitHubContributions(username: string): Promise<ContributionDay[]> {
    try {
        // Using a public API that scrapes GitHub contributions
        const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();

        // Transform to ActivityCalendar format
        return data.contributions.map((day: { date: string; count: number; level: number }) => ({
            date: day.date,
            count: day.count,
            level: Math.min(day.level, 4) as 0 | 1 | 2 | 3 | 4,
        }));
    } catch (error) {
        console.error("Failed to fetch GitHub contributions:", error);
        // Return empty data on error
        return [];
    }
}

export default function GithubGraph() {
    const { theme } = useTheme();
    const { t } = useTranslation("GithubGraph");
    const { language: locale } = useTranslation();
    const [data, setData] = useState<ContributionDay[]>([]);
    const [loading, setLoading] = useState(true);
    const labels = useMemo(() => {
        const months = [
            t("months.jan"),
            t("months.feb"),
            t("months.mar"),
            t("months.apr"),
            t("months.may"),
            t("months.jun"),
            t("months.jul"),
            t("months.aug"),
            t("months.sep"),
            t("months.oct"),
            t("months.nov"),
            t("months.dec"),
        ];
        const weekdays = [
            t("weekdays.sun"),
            t("weekdays.mon"),
            t("weekdays.tue"),
            t("weekdays.wed"),
            t("weekdays.thu"),
            t("weekdays.fri"),
            t("weekdays.sat"),
        ];
        return {
            legend: {
                less: t("legend.less"),
                more: t("legend.more"),
            },
            months,
            weekdays,
            totalCount: t("totalCount", { count: "{{count}}", year: "{{year}}" }),
        };
    }, [t]);

    useEffect(() => {
        fetchGitHubContributions(GITHUB_USERNAME).then((contributions) => {
            setData(contributions);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="w-full h-32 flex items-center justify-center text-white/30 text-sm">
                {t("loading")}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="w-full h-32 flex items-center justify-center text-white/30 text-sm">
                {t("empty")}
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden text-white/50 text-xs">
            <ActivityCalendar
                data={data}
                labels={labels}
                theme={{
                    light: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                    dark: ['rgba(255,255,255,0.05)', '#00384d', '#006b8f', '#00a7c5', '#48d5ff'], // Custom Tengra Colors
                }}
                colorScheme={theme === 'dark' ? 'dark' : 'light'}
                showWeekdayLabels
                renderBlock={(block, activity) => {
                    const dateLabel = new Date(activity.date).toLocaleDateString(locale, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    });
                    return (
                        <div title={t("blockTitle", { count: activity.count, date: dateLabel })} className={block.props.className} style={block.props.style}>
                        {block}
                        </div>
                    );
                }}
            />
            <style jsx global>{`
            .react-activity-calendar__count {
                display: none; // Hide total count for minimalist look
            }
        `}</style>
        </div>
    );
}
