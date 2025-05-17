"use client";

import { Suspense } from 'react';
import ProjectClient from './ProjectClient';
import styles from './page.module.css';
import MainLayout from '@/components/layout/MainLayout';

// Loading component for Suspense fallback
function BoardLoader() {
  return (
    <MainLayout user={null} recentProjects={[]} onLogout={() => {}}>
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Завантаження дошки...</p>
      </div>
    </MainLayout>
  );
}

// Convert the entire page component to a client component
export default function ProjectPage({ params }: { params: { projectId: string } }) {
  // We can safely access params.projectId without awaiting in a client component
  const { projectId } = params;
  
  return (
    <Suspense fallback={<BoardLoader />}>
      <ProjectClient projectId={projectId} />
    </Suspense>
  );
}