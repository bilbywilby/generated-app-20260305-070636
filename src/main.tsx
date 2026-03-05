import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import TemplatesPage from '@/pages/TemplatesPage';
import DraftEditorPage from '@/pages/DraftEditorPage';
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/templates",
    element: <TemplatesPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/drafts",
    element: <HomePage />, // Dashboard acts as drafts list for now
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/drafts/:id",
    element: <DraftEditorPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/settings",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  }
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
)