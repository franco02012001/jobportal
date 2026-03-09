'use client';

import { JobsListClient } from '../JobsListClient';

export default function RecommendedJobsPage() {
  return <JobsListClient filter="recommended" />;
}
