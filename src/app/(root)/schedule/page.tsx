"use client";
import LoaderUI from "@/components/LoaderUI";
import { useUserRole } from "@/hooks/useUserRole";
import { useRouter } from "next/navigation";
import React from "react";
import InterviewScheduleUI from "./InterviewScheduleUI";

export default function SchedulePage() {
  const router = useRouter();

  const { isInterviewer, isLoading } = useUserRole();
  if (isLoading) return <LoaderUI />;
  if (!isInterviewer) router.push("/");
  return <InterviewScheduleUI />;
}
