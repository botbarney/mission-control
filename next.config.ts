import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    taskTrackerPath: '/Users/barneystinson/.openclaw/workspace/agents/task_tracker.json',
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
