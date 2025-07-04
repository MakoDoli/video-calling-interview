"use client";

import LoaderUI from "@/components/LoaderUI";
import RecordingCard from "@/components/RecordingCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import useGetCalls from "@/hooks/useGetCalls";
import { CallRecording } from "@stream-io/video-react-sdk";
import React, { useEffect, useState } from "react";

export default function RecordingsPage() {
  const { calls, isLoading } = useGetCalls();
  const [recordings, setRecordings] = useState<CallRecording[]>();
  useEffect(() => {
    const fetchRecordings = async () => {
      console.log("CALLSS!!!!", calls);
      if (!calls) return;

      try {
        const callData = await Promise.all(
          calls.map((call) => call.queryRecordings())
        );

        const allRecordings = callData.flatMap((call) => call.recordings);

        setRecordings(allRecordings);
      } catch (err) {
        console.log("Error fetching recordings", err);
      }
    };
    fetchRecordings();
  }, [calls]);

  if (isLoading) return <LoaderUI />;
  return (
    <div className="container max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold">Recordings</h1>
      <p className="text-muted-foreground my-1">
        {recordings?.length}{" "}
        {recordings?.length === 1 ? "recording" : "recordings"} available
      </p>

      <ScrollArea className="h-[calc(100vh -12rem)] mt-3">
        {recordings && recordings?.length > 0 ? (
          <div className="grid gird-col-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
            {recordings?.map((r) => (
              <RecordingCard key={r.end_time} recording={r} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h[400px] gap-4">
            <p className="text-xl font-medium text-muted-foreground">
              No recordings available
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
