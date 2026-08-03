"use client";

import { useEffect, useState } from "react";

type LocalDestinationTimeProps = {
  timeZone: string;
};

function formatTime(timeZone: string) {
  return new Intl.DateTimeFormat("en", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

export default function LocalDestinationTime({
  timeZone,
}: LocalDestinationTimeProps) {
  const [localTime, setLocalTime] = useState("");

  useEffect(() => {
    const updateTime = () => setLocalTime(formatTime(timeZone));
    updateTime();
    const timer = window.setInterval(updateTime, 60_000);

    return () => window.clearInterval(timer);
  }, [timeZone]);

  return <span>{localTime || "Local time"}</span>;
}
