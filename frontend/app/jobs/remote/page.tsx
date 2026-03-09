'use client';

import { JobsListClient } from '../JobsListClient';

export default function RemoteJobsPage() {
  return <JobsListClient filter="remote" />;
}
