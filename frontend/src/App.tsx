import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ResumeProvider } from '@/context/ResumeContext';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import ResumeBuilder from '@/pages/ResumeBuilder';
import SelectTemplate from '@/pages/SelectTemplate';
import UploadResume from '@/pages/UploadResume';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <AuthProvider>
                <ResumeProvider>
                    <Toaster richColors position="top-right" />
                    <BrowserRouter>
                        <Routes>
                            {/* Public routes */}
                            <Route path="/" element={<Index />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Protected routes — require authentication */}
                            <Route path="/dashboard" element={
                                <ProtectedRoute><Dashboard /></ProtectedRoute>
                            } />
                            <Route path="/builder" element={
                                <ProtectedRoute><ResumeBuilder /></ProtectedRoute>
                            } />
                            <Route path="/select-template" element={
                                <ProtectedRoute><SelectTemplate /></ProtectedRoute>
                            } />
                            <Route path="/upload" element={
                                <ProtectedRoute><UploadResume /></ProtectedRoute>
                            } />

                            {/* Fallback */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </BrowserRouter>
                </ResumeProvider>
            </AuthProvider>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
