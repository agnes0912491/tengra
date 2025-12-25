"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@tengra/language";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Project {
    id: string;
    title: string;
    description: string;
    url: string; // slug
    image: string; // logoUrl
    visits: string | number;
    createdAt: string;
}

export default function ProjectsPage() {
    const { t } = useTranslation("Projects");
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProjects() {
            try {
                const res = await fetch("https://api.tengra.studio/projects");
                if (res.ok) {
                    const data = await res.json();
                    setProjects(data.projects || []);
                }
            } catch (error) {
                console.error("Failed to fetch projects:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto py-24 px-4 min-h-screen text-center">
                <div className="animate-pulse text-muted-foreground">{t("description")}...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-24 px-4 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
            >
                <div className="space-y-4 max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-bold font-orbitron tracking-tight text-gradient">
                        {t("title")}
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        {t("description")}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                        >
                            <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors group flex flex-col">
                                <CardHeader className="p-0 overflow-hidden rounded-t-lg relative aspect-video">
                                    {project.image ? (
                                        <Image
                                            src={project.image}
                                            alt={t("imageAlt", { name: project.title })}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                                            <Globe className="w-12 h-12 text-muted-foreground/30" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                                            <Link href={`/${project.url}`}>{t("viewProject")}</Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 flex-1 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-xl font-bold font-orbitron">{project.title}</CardTitle>
                                        {/* <Badge variant="secondary">{project.visits} views</Badge> */}
                                    </div>
                                    <p className="text-muted-foreground text-sm line-clamp-3">
                                        {project.description || t("fallbackDescription")}
                                    </p>
                                </CardContent>
                                <CardFooter className="p-6 pt-0">
                                    <Link href={`/${project.url}`} className="text-primary hover:underline text-sm flex items-center gap-1 group/link">
                                        {t("viewProject")} <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                                    </Link>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
