import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Download, Users, Award, FileText, Search, Bell, LogOut, Menu, X, LayoutDashboard, Database, FileBarChart, Settings, UserCog, Edit2, Trash2, Plus, Eye, Calendar, Filter, ChevronDown, Shield, TrendingUp, Activity, Clock, CheckCircle, AlertCircle, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, QrCode, HardDrive, Monitor, MonitorOff, Smartphone, XCircle, Frown, Meh, Smile, Star, MinusCircle, MessageSquare, FileCheck, Loader, ArrowLeft } from 'lucide-react';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { SurveyQuestion, SurveyResponse, User } from '../App';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableQuestionItem } from './DraggableQuestionItem';
import { useAuth } from '../context/AuthContext';
import { addUserToFirebase, getAllUsers, subscribeToUsers, updateUserProfile, deleteUserProfile, AdminUser } from '../services/firebaseUserService';
import { canManageUsers, canManageQuestions, canViewResponses, canConfigureSettings } from '../services/permissionService';
import { exportToCSV, generatePDFReport } from '../services/exportService';
import ArtaSurveyImage from '../assets/ARTA-Survey.png';

interface AdminDashboardProps {
  responses: SurveyResponse[];
  questions: SurveyQuestion[];
  users: User[];
  onAddQuestion: (question: SurveyQuestion) => void;
  onUpdateQuestion: (id: string, updates: Partial<SurveyQuestion>) => void;
  onDeleteQuestion: (id: string) => void;
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (id: number, updates: Partial<User>) => void;
  onDeleteUser: (id: number) => void;
  onReorderQuestions: (reorderedQuestions: SurveyQuestion[]) => void;
  onLogout: () => void;
}

const getRatingLabel = (value: string) => {
  const labels: Record<string, string> = {
    '1': 'Strongly Disagree',
    '2': 'Disagree',
    '3': 'Neither',
    '4': 'Agree',
    '5': 'Strongly Agree',
    'na': 'N/A'
  };
  return labels[value] || value;
};

const getRatingIcon = (value: string) => {
  switch(value) {
    case '1': return <XCircle className="w-4 h-4 text-red-600" />;
    case '2': return <Frown className="w-4 h-4 text-orange-600" />;
    case '3': return <Meh className="w-4 h-4 text-yellow-600" />;
    case '4': return <Smile className="w-4 h-4 text-lime-600" />;
    case '5': return <Star className="w-4 h-4 text-green-600 fill-green-600" />;
    case 'na': return <MinusCircle className="w-4 h-4 text-gray-600" />;
    default: return null;
  }
};

export function AdminDashboard({
  responses,
  questions,
  users,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onReorderQuestions,
  onLogout
}: AdminDashboardProps) {
  const { user, firebaseUser, loading: authLoading, error: authError, login, logout, resetPassword, clearError } = useAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetPasswordEmail, setResetPasswordEmail] = useState('');
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addUserConfirmOpen, setAddUserConfirmOpen] = useState(false);
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editUserConfirmOpen, setEditUserConfirmOpen] = useState(false);
  const [editQuestionOpen, setEditQuestionOpen] = useState(false);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [deleteUserConfirmOpen, setDeleteUserConfirmOpen] = useState(false);
  const [deleteQuestionOpen, setDeleteQuestionOpen] = useState(false);
  const [deleteQuestionConfirmOpen, setDeleteQuestionConfirmOpen] = useState(false);
  const [qrCodeOpen, setQrCodeOpen] = useState(false);
  const [exportConfirmOpen, setExportConfirmOpen] = useState(false);
  const [exportType, setExportType] = useState('');
  const [actionSuccessOpen, setActionSuccessOpen] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');
  const [actionErrorOpen, setActionErrorOpen] = useState(false);
  const [actionErrorMessage, setActionErrorMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<SurveyQuestion | null>(null);
  const [pendingUserData, setPendingUserData] = useState<any>(null);
  const [pendingUserEdit, setPendingUserEdit] = useState<any>(null);
  const [firebaseUsers, setFirebaseUsers] = useState<AdminUser[]>([]);
  const [firebaseUsersLoading, setFirebaseUsersLoading] = useState(true);
  const [firebaseUsersError, setFirebaseUsersError] = useState<string | null>(null);

  // Form states
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'Staff', password: '' });
  const [editUserForm, setEditUserForm] = useState({ name: '', role: 'Staff', status: 'Active' });
  const [newQuestionForm, setNewQuestionForm] = useState({ 
    id: '', 
    text: '', 
    type: 'Likert' as 'Likert' | 'Radio' | 'Text', 
    required: true, 
    category: 'SQD' as 'SQD' | 'CC',
    choices: [''] 
  });

  // Settings state
  const [kioskMode, setKioskMode] = useState(false);
  const [kioskOrientation, setKioskOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [offlineMode, setOfflineMode] = useState(false);
  const [dataRetention, setDataRetention] = useState('1year');
  const [kioskModeConfirmOpen, setKioskModeConfirmOpen] = useState(false);
  const [sortedQuestions, setSortedQuestions] = useState<SurveyQuestion[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveOrderConfirmOpen, setSaveOrderConfirmOpen] = useState(false);
  const [unsavedChangesWarningOpen, setUnsavedChangesWarningOpen] = useState(false);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const [reloading, setReloading] = useState(false);
  
  // Live update notification state
  const [lastResponseCount, setLastResponseCount] = useState(responses.length);
  const [newResponseNotification, setNewResponseNotification] = useState(false);
  const [highlightCards, setHighlightCards] = useState(false);

  // Detect when new responses arrive and show notification
  useEffect(() => {
    if (responses.length > lastResponseCount) {
      setNewResponseNotification(true);
      setHighlightCards(true);
      // Auto-dismiss notification after 5 seconds
      const timer = setTimeout(() => setNewResponseNotification(false), 5000);
      // Stop highlighting after 2 seconds
      const highlightTimer = setTimeout(() => setHighlightCards(false), 2000);
      return () => {
        clearTimeout(timer);
        clearTimeout(highlightTimer);
      };
    }
    setLastResponseCount(responses.length);
  }, [responses.length, lastResponseCount]);

  // Initialize sorted questions
  useEffect(() => {
    const sorted = [...questions].sort((a, b) => a.order - b.order);
    setSortedQuestions(sorted);
  }, [questions]);

  // Load kiosk mode and orientation from localStorage on mount
  useEffect(() => {
    const isKioskMode = localStorage.getItem('kioskMode') === 'true';
    const savedOrientation = localStorage.getItem('kioskOrientation') as 'landscape' | 'portrait' | null;
    setKioskMode(isKioskMode);
    if (savedOrientation) {
      setKioskOrientation(savedOrientation);
    }
  }, []);

  // Load Firebase users on mount and keep subscription active
  useEffect(() => {
    setFirebaseUsersLoading(true);
    setFirebaseUsersError(null);

    const unsubscribe = subscribeToUsers(
      (users) => {
        setFirebaseUsers(users);
        setFirebaseUsersLoading(false);
        setFirebaseUsersError(null);
      },
      (error) => {
        console.error('Failed to load users:', error);
        setFirebaseUsersLoading(false);
        
        // Check if it's a permission denied error
        if (error?.code === 'permission-denied') {
          setFirebaseUsersError(
            'Permission denied. Check Firestore security rules. Users collection must be readable by authenticated users.'
          );
        } else {
          setFirebaseUsersError(error?.message || 'Failed to load users from Firestore');
        }
      }
    );

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  // Populate edit form when user is selected
  useEffect(() => {
    if (selectedUser && editUserOpen) {
      setEditUserForm({
        name: selectedUser.name,
        role: selectedUser.role,
        status: selectedUser.status
      });
    }
  }, [selectedUser, editUserOpen]);

  const handleKioskModeToggle = (checked: boolean) => {
    if (checked) {
      // If turning ON, show confirmation modal
      setKioskModeConfirmOpen(true);
    } else {
      // If turning OFF, just disable it
      setKioskMode(false);
      localStorage.removeItem('kioskMode');
      // Dispatch custom event for same-window updates
      window.dispatchEvent(new Event('kioskModeChange'));
      setActionSuccessMessage('Kiosk mode disabled! The sidebar and navigation are now visible.');
      setActionSuccessOpen(true);
    }
  };

  const confirmKioskMode = () => {
    setKioskMode(true);
    localStorage.setItem('kioskMode', 'true');
    localStorage.setItem('kioskOrientation', kioskOrientation);
    // Dispatch custom event for same-window updates
    window.dispatchEvent(new Event('kioskModeChange'));
    setKioskModeConfirmOpen(false);
    setActionSuccessMessage('Kiosk mode enabled! The survey interface is now optimized for touch screen displays.');
    setActionSuccessOpen(true);
  };

  const handleOrientationChange = (orientation: 'landscape' | 'portrait') => {
    setKioskOrientation(orientation);
    localStorage.setItem('kioskOrientation', orientation);
    // Dispatch custom event for orientation updates
    window.dispatchEvent(new Event('kioskOrientationChange'));
    if (kioskMode) {
      setActionSuccessMessage(`Kiosk orientation updated to ${orientation} mode.`);
      setActionSuccessOpen(true);
    }
  };

  const moveQuestion = useCallback((dragIndex: number, hoverIndex: number) => {
    setSortedQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions];
      const [removed] = newQuestions.splice(dragIndex, 1);
      newQuestions.splice(hoverIndex, 0, removed);
      
      // Update order property
      const reordered = newQuestions.map((q, idx) => ({ ...q, order: idx + 1 }));
      setHasUnsavedChanges(true);
      return reordered;
    });
  }, []);

  const saveQuestionOrder = () => {
    // Show confirmation modal
    setSaveOrderConfirmOpen(true);
  };

  const confirmSaveOrder = async () => {
    // Call the parent handler to persist the new order
    if (onReorderQuestions) {
      try {
        await onReorderQuestions(sortedQuestions);
        setHasUnsavedChanges(false);
        setSaveOrderConfirmOpen(false);
        setActionSuccessMessage('Question order saved successfully!');
        setActionSuccessOpen(true);
      } catch (error) {
        console.error('Failed to save question order:', error);
        setActionErrorMessage(`Failed to save question order: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setActionErrorOpen(true);
      }
    }
  };

  const handleSectionChange = (newSection: string) => {
    if (currentSection === 'manage' && hasUnsavedChanges) {
      // Show warning if leaving manage section with unsaved changes
      setPendingSection(newSection);
      setUnsavedChangesWarningOpen(true);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
      setCurrentSection(newSection);
      setSidebarOpen(false);
    }
  };

  const discardChanges = () => {
    setHasUnsavedChanges(false);
    setUnsavedChangesWarningOpen(false);
    if (pendingSection) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      setCurrentSection(pendingSection);
      setPendingSection(null);
      setSidebarOpen(false);
      // Reset to original order
      const sorted = [...questions].sort((a, b) => a.order - b.order);
      setSortedQuestions(sorted);
    }
  };

  const saveAndContinue = () => {
    confirmSaveOrder();
    setUnsavedChangesWarningOpen(false);
    if (pendingSection) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        setCurrentSection(pendingSection);
        setPendingSection(null);
        setSidebarOpen(false);
      }, 100);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await login(loginEmail, loginPassword);
      setReloading(true);
      // Reload the page instantly after successful login
      location.reload();
    } catch (err) {
      setLoginError(authError || 'Login failed');
    }
  };

  const handleLogoutClick = async () => {
    try {
      await logout();
      setCurrentSection('dashboard');
      setSidebarOpen(false);
      onLogout();
    } catch (err) {
      setLoginError('Logout failed');
    }
  };

  const handleExport = (type: string) => {
    setExportType(type);
    setExportConfirmOpen(true);
  };

  const confirmExport = () => {
    try {
      setExportConfirmOpen(false);
      
      const timestamp = new Date().toISOString().split('T')[0];
      
      if (exportType === 'CSV' || exportType === 'CSV Export') {
        exportToCSV(filteredResponses, questions, `survey_responses_${timestamp}.csv`);
        setActionSuccessMessage(`CSV export started! Your download will begin shortly.`);
      } else if (exportType === 'PDF Report') {
        generatePDFReport(filteredResponses, questions, `survey_report_${timestamp}.pdf`);
        setActionSuccessMessage(`PDF report generated! Your download will begin shortly.`);
      } else if (exportType === 'ARTA Compliance Report') {
        generatePDFReport(filteredResponses, questions, `arta_compliance_report_${timestamp}.pdf`);
        setActionSuccessMessage(`ARTA Compliance report generated! Your download will begin shortly.`);
      } else {
        setActionSuccessMessage(`${exportType} export completed!`);
      }
      
      setActionSuccessOpen(true);
    } catch (error) {
      console.error('Export error:', error);
      setActionErrorMessage(`Failed to export ${exportType}. Please try again.`);
      setActionErrorOpen(true);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (changePasswordForm.new !== changePasswordForm.confirm) {
      setActionErrorMessage('Passwords do not match. Please try again.');
      setActionErrorOpen(true);
      return;
    }
    console.log('Password changed successfully');
    setChangePasswordOpen(false);
    setChangePasswordForm({ current: '', new: '', confirm: '' });
    setActionSuccessMessage('Password changed successfully!');
    setActionSuccessOpen(true);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await resetPassword(resetPasswordEmail);
      setResetPasswordSuccess(true);
    } catch (err) {
      setLoginError('Failed to send reset email. Please check the email address.');
    }
  };

  const handleResetPasswordClose = () => {
    setForgotPasswordOpen(false);
    setResetPasswordSuccess(false);
    setResetPasswordEmail('');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.password) {
      setActionErrorMessage('Password is required');
      setActionErrorOpen(true);
      return;
    }
    setPendingUserData({
      name: newUserForm.name,
      email: newUserForm.email,
      role: newUserForm.role,
      password: newUserForm.password,
      status: 'Active'
    });
    setAddUserOpen(false);
    setAddUserConfirmOpen(true);
  };

  const confirmAddUser = async () => {
    if (pendingUserData) {
      try {
        await addUserToFirebase(
          pendingUserData.email,
          pendingUserData.password,
          pendingUserData.name,
          pendingUserData.role
        );
        setNewUserForm({ name: '', email: '', role: 'Staff', password: '' });
        setPendingUserData(null);
        setAddUserConfirmOpen(false);
        setActionSuccessMessage('User added successfully!');
        setActionSuccessOpen(true);
      } catch (err: any) {
        setActionErrorMessage(err.message || 'Failed to add user');
        setActionErrorOpen(true);
      }
    }
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    setPendingUserEdit({
      uid: selectedUser?.id,
      updates: {
        name: editUserForm.name,
        role: editUserForm.role,
        status: editUserForm.status,
      }
    });
    setEditUserOpen(false);
    setEditUserConfirmOpen(true);
  };

  const confirmEditUser = async () => {
    if (pendingUserEdit) {
      try {
        await updateUserProfile(pendingUserEdit.uid, pendingUserEdit.updates);
        setPendingUserEdit(null);
        setSelectedUser(null);
        setEditUserConfirmOpen(false);
        setActionSuccessMessage('User updated successfully!');
        setActionSuccessOpen(true);
      } catch (err: any) {
        setActionErrorMessage(err.message || 'Failed to update user');
        setActionErrorOpen(true);
      }
    }
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      setDeleteUserOpen(false);
      setDeleteUserConfirmOpen(true);
    }
  };

  const confirmDeleteUser = async () => {
    if (selectedUser) {
      try {
        await deleteUserProfile(selectedUser.id);
        setDeleteUserConfirmOpen(false);
        setSelectedUser(null);
        setActionSuccessMessage('User deleted successfully!');
        setActionSuccessOpen(true);
      } catch (err: any) {
        setActionErrorMessage(err.message || 'Failed to delete user');
        setActionErrorOpen(true);
      }
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if question ID already exists
    const idExists = questions.some(q => q.id.toLowerCase() === newQuestionForm.id.toLowerCase());
    if (idExists) {
      setActionErrorMessage(`Question ID "${newQuestionForm.id}" is already in use. Please choose a different ID.`);
      setActionErrorOpen(true);
      return;
    }
    
    // Validate Radio type has at least 2 choices
    if (newQuestionForm.type === 'Radio' && newQuestionForm.choices.filter(c => c.trim()).length < 2) {
      setActionErrorMessage('Radio button questions must have at least 2 choices.');
      setActionErrorOpen(true);
      return;
    }
    
    try {
      await onAddQuestion(newQuestionForm);
      setNewQuestionForm({ id: '', text: '', type: 'Likert', required: true, category: 'SQD', choices: [''] });
      setAddQuestionOpen(false);
      setActionSuccessMessage('Question added successfully!');
      setActionSuccessOpen(true);
    } catch (error) {
      console.error('Failed to add question:', error);
      setActionErrorMessage(`Failed to add question: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setActionErrorOpen(true);
    }
  };

  const handleEditQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestion) {
      try {
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        // Send the complete updated question object
        await onUpdateQuestion(selectedQuestion.id, {
          ...selectedQuestion,
          text: formData.get('text') as string,
          required: formData.get('required') === 'true',
        });
        setEditQuestionOpen(false);
        setSelectedQuestion(null);
        setActionSuccessMessage('Question updated successfully!');
        setActionSuccessOpen(true);
      } catch (error) {
        console.error('Failed to update question:', error);
        setActionErrorMessage(`Failed to update question: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setActionErrorOpen(true);
      }
    }
  };

  const handleDeleteQuestion = () => {
    if (selectedQuestion) {
      setDeleteQuestionOpen(false);
      setDeleteQuestionConfirmOpen(true);
    }
  };

  const confirmDeleteQuestion = async () => {
    if (selectedQuestion) {
      try {
        await onDeleteQuestion(selectedQuestion.id);
        setDeleteQuestionConfirmOpen(false);
        setSelectedQuestion(null);
        setActionSuccessMessage('Question deleted successfully!');
        setActionSuccessOpen(true);
      } catch (error) {
        console.error('Failed to delete question:', error);
        setActionErrorMessage(`Failed to delete question: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setActionErrorOpen(true);
      }
    }
  };

  const totalResponses = responses.length;
  const avgSatisfaction = responses.length > 0 
    ? responses.reduce((sum, r) => sum + r.sqdAvg, 0) / responses.length 
    : 0;
  
  // Calculate responses from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentResponses = responses.filter(r => new Date(r.date) >= thirtyDaysAgo);
  
  // Calculate satisfaction trend (comparing last 7 days to previous 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  
  const lastWeekResponses = responses.filter(r => new Date(r.date) >= sevenDaysAgo);
  const previousWeekResponses = responses.filter(r => {
    const date = new Date(r.date);
    return date >= fourteenDaysAgo && date < sevenDaysAgo;
  });
  
  const lastWeekAvg = lastWeekResponses.length > 0
    ? lastWeekResponses.reduce((sum, r) => sum + r.sqdAvg, 0) / lastWeekResponses.length
    : 0;
  const previousWeekAvg = previousWeekResponses.length > 0
    ? previousWeekResponses.reduce((sum, r) => sum + r.sqdAvg, 0) / previousWeekResponses.length
    : 0;
  
  const satisfactionTrend = previousWeekAvg > 0 
    ? ((lastWeekAvg - previousWeekAvg) / previousWeekAvg) * 100 
    : 0;

  // Calculate service ratings from actual data
  const serviceRatingData = useMemo(() => {
    const serviceMap: Record<string, { total: number; count: number }> = {};
    responses.forEach(r => {
      if (!serviceMap[r.service]) {
        serviceMap[r.service] = { total: 0, count: 0 };
      }
      serviceMap[r.service].total += r.sqdAvg;
      serviceMap[r.service].count++;
    });
    return Object.entries(serviceMap).map(([service, data]) => ({
      service,
      avgRating: data.total / data.count
    })).sort((a, b) => b.avgRating - a.avgRating);
  }, [responses]);

  // Calculate client type distribution from actual data
  const clientTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    responses.forEach(r => {
      const type = r.clientType.charAt(0).toUpperCase() + r.clientType.slice(1);
      counts[type] = (counts[type] || 0) + 1;
    });
    const colors: Record<string, string> = { 'Citizen': '#003366', 'Business': '#007BFF', 'Government': '#4A90E2' };
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || '#999'
    }));
  }, [responses]);

  // Daily responses (last 7 days) from actual data
  const dailyResponsesData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });
    
    return last7Days.map(date => {
      const count = responses.filter(r => r.date === date).length;
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        responses: count
      };
    });
  }, [responses]);

  const topServices = serviceRatingData.slice(0, 3).map(s => `${s.service} (${s.avgRating.toFixed(1)})`);

  // Filtered responses based on search query
  const filteredResponses = useMemo(() => {
    if (!searchQuery.trim()) return responses;
    
    const query = searchQuery.toLowerCase();
    return responses.filter(response => 
      response.refId.toLowerCase().includes(query) ||
      response.service.toLowerCase().includes(query) ||
      response.clientType.toLowerCase().includes(query) ||
      response.date.includes(query)
    );
  }, [responses, searchQuery]);

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg animate-spin">
              <Loader className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Login Screen
  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        {reloading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="text-center space-y-4">
              <div className="inline-block">
                <div className="w-16 h-16 border-4 border-white border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-white font-semibold">Loading your session...</p>
            </div>
          </div>
        )}
        <Card className="max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.15)] border-2 border-border">
          <CardHeader className="text-center space-y-6 pb-8 relative">
            {/* Back Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="absolute top-4 left-4 text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-14 h-14 text-primary-foreground" />
              </div>
            </div>
            <div>
              <CardTitle className="text-primary mb-2">ARTA CSS Admin Portal</CardTitle>
              <CardDescription>City Government of Valenzuela</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{loginError}</p>
                </div>
              )}
              <div className="space-y-3">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@valenzuela.gov.ph"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  disabled={authLoading}
                  className="h-12"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={authLoading}
                  className="h-12"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-secondary hover:bg-secondary/90"
                disabled={authLoading}
              >
                {authLoading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2 rotate-180" />
                    Login to Dashboard
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full" 
                onClick={() => {
                  setForgotPasswordOpen(true);
                  clearError();
                }}
                disabled={authLoading}
              >
                Forgot Password?
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Forgot Password Dialog */}
        <Dialog open={forgotPasswordOpen} onOpenChange={handleResetPasswordClose}>
          <DialogContent className="max-w-md">
            {!resetPasswordSuccess ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Reset Password
                  </DialogTitle>
                  <DialogDescription>
                    Enter your email address and we&apos;ll send you a link to reset your password.
                  </DialogDescription>
                </DialogHeader>
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{loginError}</p>
                  </div>
                )}
                <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email Address</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="admin@valenzuela.gov.ph"
                      value={resetPasswordEmail}
                      onChange={(e) => setResetPasswordEmail(e.target.value)}
                      required
                      disabled={authLoading}
                      className="h-12"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleResetPasswordClose} 
                      className="flex-1"
                      disabled={authLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-secondary hover:bg-secondary/90"
                      disabled={authLoading}
                    >
                      {authLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Email Sent Successfully
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 leading-relaxed">
                      A password reset link has been sent to <strong>{resetPasswordEmail}</strong>. Please check your email inbox and follow the instructions to reset your password.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800 leading-relaxed">
                      <strong>Note:</strong> The reset link will expire in 24 hours. If you don&apos;t receive the email within a few minutes, please check your spam folder.
                    </p>
                  </div>
                  <Button onClick={handleResetPasswordClose} className="w-full bg-secondary hover:bg-secondary/90">
                    Close
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Main Dashboard - Continued in next part due to character limits
  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-64 bg-white border-r border-border transition-transform duration-300 fixed lg:static inset-y-0 left-0 z-40 shadow-lg lg:shadow-none flex flex-col`}>
        <div className="h-full flex flex-col overflow-hidden">
          {/* Logo */}
          <div className="p-6 border-b border-border bg-primary/5 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h3 className="text-primary truncate">ARTA CSS</h3>
                <p className="text-xs text-muted-foreground truncate">Admin Portal</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button
              onClick={() => handleSectionChange('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentSection === 'dashboard' ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-muted'
              }`}
              title="View dashboard and statistics"
            >
              <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Dashboard</span>
            </button>
            
            <button
              onClick={() => canViewResponses(user?.role || 'Enumerator') && handleSectionChange('responses')}
              disabled={!canViewResponses(user?.role || 'Enumerator')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                !canViewResponses(user?.role || 'Enumerator') 
                  ? 'opacity-50 cursor-not-allowed text-muted-foreground' 
                  : currentSection === 'responses' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'hover:bg-muted'
              }`}
              title={canViewResponses(user?.role || 'Enumerator') ? 'View raw survey responses' : 'Requires permission'}
            >
              <Database className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Raw Responses</span>
            </button>
            
            <button
              onClick={() => canViewResponses(user?.role || 'Enumerator') && handleSectionChange('reports')}
              disabled={!canViewResponses(user?.role || 'Enumerator')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                !canViewResponses(user?.role || 'Enumerator') 
                  ? 'opacity-50 cursor-not-allowed text-muted-foreground' 
                  : currentSection === 'reports' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'hover:bg-muted'
              }`}
              title={canViewResponses(user?.role || 'Enumerator') ? 'View reports and analytics' : 'Requires permission'}
            >
              <FileBarChart className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Reports</span>
            </button>
            
            <button
              onClick={() => canManageQuestions(user?.role || 'Enumerator') && handleSectionChange('manage')}
              disabled={!canManageQuestions(user?.role || 'Enumerator')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                !canManageQuestions(user?.role || 'Enumerator') 
                  ? 'opacity-50 cursor-not-allowed text-muted-foreground' 
                  : currentSection === 'manage' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'hover:bg-muted'
              }`}
              title={canManageQuestions(user?.role || 'Enumerator') ? 'Manage survey questions' : 'Requires permission'}
            >
              <Edit2 className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Manage Questions</span>
            </button>
            
            <button
              onClick={() => canConfigureSettings(user?.role || 'Enumerator') && handleSectionChange('settings')}
              disabled={!canConfigureSettings(user?.role || 'Enumerator')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                !canConfigureSettings(user?.role || 'Enumerator') 
                  ? 'opacity-50 cursor-not-allowed text-muted-foreground' 
                  : currentSection === 'settings' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'hover:bg-muted'
              }`}
              title={canConfigureSettings(user?.role || 'Enumerator') ? 'Configure system settings' : 'Requires permission'}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Settings</span>
            </button>
            
            <button
              onClick={() => canManageUsers(user?.role || 'Enumerator') && handleSectionChange('users')}
              disabled={!canManageUsers(user?.role || 'Enumerator')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                !canManageUsers(user?.role || 'Enumerator') 
                  ? 'opacity-50 cursor-not-allowed text-muted-foreground' 
                  : currentSection === 'users' 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'hover:bg-muted'
              }`}
              title={canManageUsers(user?.role || 'Enumerator') ? 'Manage user accounts' : 'Requires permission'}
            >
              <UserCog className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Users</span>
            </button>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-border flex-shrink-0">
            <Button onClick={handleLogoutClick} variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border flex-shrink-0">
            <p className="text-xs text-muted-foreground text-center">© 2025 Valenzuela City</p>
          </div>
        </div>
      </aside>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content - Will continue in next message */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b border-border shadow-sm sticky top-0 z-20 flex-shrink-0">
          <div className="flex items-center justify-between p-4 gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden flex-shrink-0"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div className="flex-1 min-w-0">
                <h2 className="text-primary hidden xl:block truncate">ARTA Customer Satisfaction Survey Dashboard</h2>
                <h2 className="text-primary hidden md:block xl:hidden truncate">ARTA CSS Dashboard</h2>
              </div>
            </div>

            {/* Search Bar - Only show in Raw Responses */}
            {currentSection === 'responses' && (
              <div className="relative flex-1 max-w-md hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Search by Reference ID or Service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Right Side Icons */}
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="hidden md:inline truncate max-w-[100px]">{user?.name || 'Admin'}</span>
                    <ChevronDown className="w-4 h-4 hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="flex flex-col">
                    <span>{user?.name || 'User'}</span>
                    <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setChangePasswordOpen(true)}>
                    <Shield className="w-4 h-4 mr-2" />
                    Change Password
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogoutClick} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Mobile Search Bar - Only show in Raw Responses */}
          {currentSection === 'responses' && (
            <div className="px-4 pb-4 sm:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search Reference ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* CONTENT SECTIONS */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {/* Dashboard Overview */}
          {currentSection === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-primary mb-2">Dashboard Overview</h1>
                <p className="text-muted-foreground">Welcome to the ARTA CSS Admin Portal</p>
              </div>

              {/* Live Update Notification */}
              {newResponseNotification && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-pulse">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-800">🔴 Live: New response(s) received! Dashboard updating...</span>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className={`shadow-md border-border transition-all duration-500 ${highlightCards ? 'ring-2 ring-green-400 shadow-lg shadow-green-200' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Total Responses</p>
                        <p className={`text-3xl mb-1 transition-all ${highlightCards ? 'text-green-600 font-bold' : 'text-primary'}`}>{totalResponses}</p>
                        <p className="text-xs text-muted-foreground">{recentResponses.length} in last 30 days</p>
                      </div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${highlightCards ? 'bg-green-100 scale-110' : 'bg-primary/10'}`}>
                        <FileText className={`w-6 h-6 ${highlightCards ? 'text-green-600' : 'text-primary'}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-md border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Avg Satisfaction</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl text-primary">{avgSatisfaction.toFixed(2)}</p>
                          <span className="text-sm text-muted-foreground">/ 5.0</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {satisfactionTrend > 0 ? (
                            <>
                              <TrendingUp className="w-3 h-3 text-green-600" />
                              <p className="text-xs text-green-600">+{satisfactionTrend.toFixed(1)}% vs last week</p>
                            </>
                          ) : satisfactionTrend < 0 ? (
                            <>
                              <TrendingUp className="w-3 h-3 text-red-600 rotate-180" />
                              <p className="text-xs text-red-600">{satisfactionTrend.toFixed(1)}% vs last week</p>
                            </>
                          ) : (
                            <p className="text-xs text-muted-foreground">No change vs last week</p>
                          )}
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-secondary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-md border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">This Week</p>
                        <p className="text-3xl text-primary mb-1">{lastWeekResponses.length}</p>
                        <p className="text-xs text-muted-foreground">
                          {lastWeekResponses.length > previousWeekResponses.length ? '+' : ''}
                          {lastWeekResponses.length - previousWeekResponses.length} vs previous week
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-chart-2/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Activity className="w-6 h-6 text-chart-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-md border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Survey Questions</p>
                        <p className="text-3xl text-primary mb-1">{questions.length}</p>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>{questions.filter(q => q.category === 'SQD').length} SQD</span>
                          <span>•</span>
                          <span>{questions.filter(q => q.category === 'CC').length} CC</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-chart-3/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileBarChart className="w-6 h-6 text-chart-3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-md border-border">
                  <CardHeader>
                    <CardTitle className="text-primary">Service Ratings</CardTitle>
                    <CardDescription>Average satisfaction by service</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={serviceRatingData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="service" angle={-45} textAnchor="end" height={100} />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Bar dataKey="avgRating" fill="#3FA7D6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="shadow-md border-border">
                  <CardHeader>
                    <CardTitle className="text-primary">Client Type Distribution</CardTitle>
                    <CardDescription>Breakdown by client category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={clientTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                          {clientTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Daily Responses */}
              <Card className="shadow-md border-border">
                <CardHeader>
                  <CardTitle className="text-primary">Daily Responses (Last 7 Days)</CardTitle>
                  <CardDescription>Response trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyResponsesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="responses" stroke="#0D3B66" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Raw Responses Section */}
          {currentSection === 'responses' && !canViewResponses(user?.role || 'Enumerator') && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <Card className="shadow-md border-red-200 bg-red-50 max-w-md">
                <CardContent className="pt-6 space-y-4 text-center">
                  <Shield className="w-12 h-12 text-red-600 mx-auto" />
                  <div>
                    <h2 className="text-lg font-semibold text-red-800">Access Denied</h2>
                    <p className="text-sm text-red-700 mt-2">You don't have permission to view survey responses. Staff and Admin roles can access this section.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentSection === 'responses' && canViewResponses(user?.role || 'Enumerator') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-primary mb-2">Raw Responses</h1>
                  <p className="text-muted-foreground">View all survey submissions ({filteredResponses.length} results)</p>
                </div>
                <Button onClick={() => handleExport('CSV')} className="bg-secondary hover:bg-secondary/90">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>

              <Card className="shadow-md border-border">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-6 py-4">Reference ID</TableHead>
                          <TableHead className="px-6 py-4">Date</TableHead>
                          <TableHead className="px-6 py-4">Service</TableHead>
                          <TableHead className="px-6 py-4">Client Type</TableHead>
                          <TableHead className="px-6 py-4">SQD Avg</TableHead>
                          <TableHead className="px-6 py-4">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredResponses.map((response) => (
                          <TableRow key={response.id}>
                            <TableCell className="font-mono text-sm px-6 py-4">{response.refId}</TableCell>
                            <TableCell className="px-6 py-4">{response.date}</TableCell>
                            <TableCell className="px-6 py-4">{response.service}</TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge variant="outline">{response.clientType}</Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge className={response.sqdAvg >= 4.5 ? 'bg-green-100 text-green-800' : response.sqdAvg >= 3.5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                                {response.sqdAvg.toFixed(2)}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedResponse(response)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reports Section */}
          {currentSection === 'reports' && !canViewResponses(user?.role || 'Enumerator') && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <Card className="shadow-md border-red-200 bg-red-50 max-w-md">
                <CardContent className="pt-6 space-y-4 text-center">
                  <Shield className="w-12 h-12 text-red-600 mx-auto" />
                  <div>
                    <h2 className="text-lg font-semibold text-red-800">Access Denied</h2>
                    <p className="text-sm text-red-700 mt-2">You don't have permission to view reports. Staff and Admin roles can access this section.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentSection === 'reports' && canViewResponses(user?.role || 'Enumerator') && (
            <div className="space-y-6">
              <div>
                <h1 className="text-primary mb-2">Reports & Analytics</h1>
                <p className="text-muted-foreground">Export and generate reports</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-md border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleExport('CSV Export')}>
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Download className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-primary">Export to CSV</h3>
                    <p className="text-sm text-muted-foreground">Download all responses as CSV file</p>
                  </CardContent>
                </Card>

                <Card className="shadow-md border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleExport('PDF Report')}>
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-secondary/10 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-secondary" />
                    </div>
                    <h3 className="text-primary">Generate PDF Report</h3>
                    <p className="text-sm text-muted-foreground">Create comprehensive analysis report</p>
                  </CardContent>
                </Card>

                <Card className="shadow-md border-border hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleExport('ARTA Compliance Report')}>
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
                      <Shield className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-primary">ARTA Compliance</h3>
                    <p className="text-sm text-muted-foreground">Official ARTA submission format</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Manage Questions Section */}
          {currentSection === 'manage' && !canManageQuestions(user?.role || 'Enumerator') && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <Card className="shadow-md border-red-200 bg-red-50 max-w-md">
                <CardContent className="pt-6 space-y-4 text-center">
                  <Shield className="w-12 h-12 text-red-600 mx-auto" />
                  <div>
                    <h2 className="text-lg font-semibold text-red-800">Access Denied</h2>
                    <p className="text-sm text-red-700 mt-2">You don't have permission to manage questions. Only Admins can access this section.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentSection === 'manage' && canManageQuestions(user?.role || 'Enumerator') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-primary mb-2">Manage Questions</h1>
                  <p className="text-muted-foreground">Drag to reorder, click to edit survey questions</p>
                  {hasUnsavedChanges && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-amber-600">You have unsaved changes</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={saveQuestionOrder} 
                    variant="outline" 
                    className={`border-primary text-primary hover:bg-primary hover:text-primary-foreground ${hasUnsavedChanges ? 'animate-pulse' : ''}`}
                    disabled={!hasUnsavedChanges}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Order
                  </Button>
                  <Button onClick={() => setAddQuestionOpen(true)} className="bg-secondary hover:bg-secondary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </div>

              {/* SQD Questions */}
              <Card className="shadow-md border-border">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    Service Quality Dimensions (SQD) Questions
                  </CardTitle>
                  <CardDescription>
                    Questions measuring satisfaction and service quality ({sortedQuestions.filter(q => q.category === 'SQD').length} questions)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <DndProvider backend={HTML5Backend}>
                    <div className="space-y-3">
                      {sortedQuestions
                        .filter(q => q.category === 'SQD')
                        .map((question, index) => (
                          <DraggableQuestionItem
                            key={question.id}
                            question={question}
                            index={sortedQuestions.indexOf(question)}
                            moveQuestion={moveQuestion}
                            onEdit={(q) => { setSelectedQuestion(q); setEditQuestionOpen(true); }}
                            onDelete={(q) => { setSelectedQuestion(q); setDeleteQuestionOpen(true); }}
                          />
                        ))}
                    </div>
                  </DndProvider>
                </CardContent>
              </Card>

              {/* CC Questions */}
              <Card className="shadow-md border-border">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Citizen's Charter (CC) Questions
                  </CardTitle>
                  <CardDescription>
                    Questions about awareness and helpfulness of Citizen's Charter ({sortedQuestions.filter(q => q.category === 'CC').length} questions)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <DndProvider backend={HTML5Backend}>
                    <div className="space-y-3">
                      {sortedQuestions
                        .filter(q => q.category === 'CC')
                        .map((question, index) => (
                          <DraggableQuestionItem
                            key={question.id}
                            question={question}
                            index={sortedQuestions.indexOf(question)}
                            moveQuestion={moveQuestion}
                            onEdit={(q) => { setSelectedQuestion(q); setEditQuestionOpen(true); }}
                            onDelete={(q) => { setSelectedQuestion(q); setDeleteQuestionOpen(true); }}
                          />
                        ))}
                    </div>
                  </DndProvider>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Section */}
          {currentSection === 'settings' && !canConfigureSettings(user?.role || 'Enumerator') && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <Card className="shadow-md border-red-200 bg-red-50 max-w-md">
                <CardContent className="pt-6 space-y-4 text-center">
                  <Shield className="w-12 h-12 text-red-600 mx-auto" />
                  <div>
                    <h2 className="text-lg font-semibold text-red-800">Access Denied</h2>
                    <p className="text-sm text-red-700 mt-2">You don't have permission to configure system settings. Only Admins can access this section.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentSection === 'settings' && canConfigureSettings(user?.role || 'Enumerator') && (
            <div className="space-y-6">
              <div>
                <h1 className="text-primary mb-2">System Settings</h1>
                <p className="text-muted-foreground">Configure application preferences</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-md border-border">
                  <CardHeader>
                    <CardTitle className="text-primary">Display Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">Kiosk Mode</p>
                        <p className="text-sm text-muted-foreground">Optimize for touch screen displays</p>
                        <div className="mt-2">
                          {kioskMode ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                              <Monitor className="w-3.5 h-3.5" />
                              Enabled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                              <MonitorOff className="w-3.5 h-3.5" />
                              Disabled
                            </span>
                          )}
                        </div>
                      </div>
                      <Switch checked={kioskMode} onCheckedChange={handleKioskModeToggle} />
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <div>
                        <p className={`font-medium ${!kioskMode ? 'text-muted-foreground' : ''}`}>Display Orientation</p>
                        <p className="text-sm text-muted-foreground">
                          {kioskMode ? 'Choose kiosk display orientation' : 'Enable Kiosk Mode to configure orientation'}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => kioskMode && handleOrientationChange('landscape')}
                          disabled={!kioskMode}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                            !kioskMode
                              ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                              : kioskOrientation === 'landscape'
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <Monitor className={`w-8 h-8 ${!kioskMode ? 'text-gray-300' : kioskOrientation === 'landscape' ? 'text-primary' : 'text-gray-400'}`} />
                          <span className={`text-sm font-medium ${!kioskMode ? 'text-gray-400' : kioskOrientation === 'landscape' ? 'text-primary' : 'text-gray-600'}`}>
                            Landscape
                          </span>
                          <span className="text-xs text-gray-500">Horizontal</span>
                        </button>
                        <button
                          onClick={() => kioskMode && handleOrientationChange('portrait')}
                          disabled={!kioskMode}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                            !kioskMode
                              ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                              : kioskOrientation === 'portrait'
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <Smartphone className={`w-8 h-8 ${!kioskMode ? 'text-gray-300' : kioskOrientation === 'portrait' ? 'text-primary' : 'text-gray-400'}`} />
                          <span className={`text-sm font-medium ${!kioskMode ? 'text-gray-400' : kioskOrientation === 'portrait' ? 'text-primary' : 'text-gray-600'}`}>
                            Portrait
                          </span>
                          <span className="text-xs text-gray-500">Vertical</span>
                        </button>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Offline Mode</p>
                        <p className="text-sm text-muted-foreground">Allow offline data collection</p>
                      </div>
                      <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-md border-border">
                  <CardHeader>
                    <CardTitle className="text-primary">Data Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="retention">Data Retention Period</Label>
                      <Select value={dataRetention} onValueChange={setDataRetention}>
                        <SelectTrigger id="retention" className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6months">6 Months</SelectItem>
                          <SelectItem value="1year">1 Year</SelectItem>
                          <SelectItem value="2years">2 Years</SelectItem>
                          <SelectItem value="indefinite">Indefinite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                    <Button variant="outline" className="w-full" onClick={() => setQrCodeOpen(true)}>
                      <QrCode className="w-4 h-4 mr-2" />
                      Generate Survey QR Code
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Users Section */}
          {currentSection === 'users' && !canManageUsers(user?.role || 'Enumerator') && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <Card className="shadow-md border-red-200 bg-red-50 max-w-md">
                <CardContent className="pt-6 space-y-4 text-center">
                  <Shield className="w-12 h-12 text-red-600 mx-auto" />
                  <div>
                    <h2 className="text-lg font-semibold text-red-800">Access Denied</h2>
                    <p className="text-sm text-red-700 mt-2">You don't have permission to manage users. Only Admins can access this section.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentSection === 'users' && canManageUsers(user?.role || 'Enumerator') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-primary mb-2">User Management</h1>
                  <p className="text-muted-foreground">Manage admin and staff accounts</p>
                </div>
                <Button onClick={() => setAddUserOpen(true)} className="bg-secondary hover:bg-secondary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>

              {firebaseUsersError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
                  <p className="text-sm text-red-800 font-medium">⚠️ Error Loading Users</p>
                  <p className="text-sm text-red-700">{firebaseUsersError}</p>
                  {firebaseUsersError?.includes('permission-denied') && (
                    <div className="bg-red-100 border border-red-300 rounded p-3 mt-2 space-y-2">
                      <p className="text-sm text-red-800 font-semibold">Quick Fix:</p>
                      <ol className="text-xs text-red-700 list-decimal list-inside space-y-1">
                        <li>Open Firebase Console: <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">console.firebase.google.com</a></li>
                        <li>Select project: <strong>arta-a6d0f</strong></li>
                        <li>Go to: <strong>Firestore Database → Rules</strong></li>
                        <li>Replace rules with the content from <strong>QUICK_FIX_SECURITY_RULES.js</strong></li>
                        <li>Click <strong>Publish</strong></li>
                        <li>Refresh this page (F5)</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}

              <Card className="shadow-md border-border">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6 py-4">Name</TableHead>
                        <TableHead className="px-6 py-4">Email</TableHead>
                        <TableHead className="px-6 py-4">Role</TableHead>
                        <TableHead className="px-6 py-4">Status</TableHead>
                        <TableHead className="px-6 py-4">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {firebaseUsersLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                            <Loader className="w-4 h-4 animate-spin mx-auto" />
                          </TableCell>
                        </TableRow>
                      ) : firebaseUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                            No users found. Click "Add User" to create one.
                          </TableCell>
                        </TableRow>
                      ) : (
                        firebaseUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="px-6 py-4">{user.name}</TableCell>
                            <TableCell className="px-6 py-4">{user.email}</TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge variant="outline">{user.role}</Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <Badge className={user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setEditUserOpen(true); }}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedUser(user); setDeleteUserOpen(true); }}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Role Guide */}
              <Card className="shadow-md border-border bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Role Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-primary border-primary">Admin</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Full system access. Can manage users, questions, view all responses, generate reports, and configure system settings.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-secondary border-secondary">Staff</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Can view responses, generate reports, and export data. Cannot manage users or modify questions.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-accent border-accent">Enumerator</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Limited access to assist citizens in completing surveys. Can only view basic statistics.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>

        <footer className="bg-white border-t border-border py-4 px-4 lg:px-8 flex-shrink-0">
          <p className="text-sm text-muted-foreground text-center">
            City Government of Valenzuela — ARTA CSS Dashboard © 2025
          </p>
        </footer>
      </div>

      {/* Dialogs */}
      
      {/* View Response Details Dialog */}
      <Dialog open={!!selectedResponse} onOpenChange={() => setSelectedResponse(null)}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto sm:w-full p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Eye className="w-5 h-5" />
              Response Details
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">{selectedResponse?.refId}</Badge>
              <Badge className={selectedResponse && selectedResponse.sqdAvg >= 4.5 ? 'bg-green-100 text-green-800' : selectedResponse && selectedResponse.sqdAvg >= 3.5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                Rating: {selectedResponse?.sqdAvg.toFixed(2)}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          {selectedResponse && (
            <div className="space-y-6 mt-4">
              {/* Client Information */}
              <div className="bg-muted/30 p-6 rounded-lg">
                <h4 className="text-primary mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Client Information
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Date</span>
                    </div>
                    <p className="text-sm font-medium">{new Date(selectedResponse.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Client Type</span>
                    </div>
                    <p className="text-sm font-medium capitalize">{selectedResponse.clientType}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Sex</span>
                    </div>
                    <p className="text-sm font-medium capitalize">{selectedResponse.sex}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Age</span>
                    </div>
                    <p className="text-sm font-medium">{selectedResponse.age} years old</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Region</span>
                    </div>
                    <p className="text-sm font-medium uppercase">{selectedResponse.region}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Service</span>
                    </div>
                    <p className="text-sm font-medium">{selectedResponse.service}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* SQD Responses */}
              <div>
                <h4 className="text-primary mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Service Quality Dimensions (SQD)
                </h4>
                <div className="space-y-2">
                  {questions.filter(q => {
                    // Only show questions that exist in the response
                    return q.category === 'SQD' && (selectedResponse[q.id as keyof SurveyResponse] !== undefined);
                  }).map((question) => {
                    const value = selectedResponse[question.id as keyof SurveyResponse] as string;
                    if (!value) return null;
                    
                    return (
                      <div key={question.id} className="p-4 bg-white border border-border rounded-lg hover:border-primary/30 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start gap-2">
                              <Badge variant="outline" className="text-xs font-mono mt-0.5">{question.id.toUpperCase()}</Badge>
                              <p className="text-sm leading-relaxed flex-1">{question.text}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 bg-muted/50 px-4 py-2 rounded-lg">
                            {getRatingIcon(value)}
                            <div className="text-right">
                              <p className="text-sm font-medium">{getRatingLabel(value)}</p>
                              {value !== 'na' && <p className="text-xs text-muted-foreground">Rating: {value}/5</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="p-5 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20 rounded-lg mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-primary fill-primary" />
                        <span className="font-medium text-primary">Overall SQD Average:</span>
                      </div>
                      <Badge className="bg-primary text-primary-foreground text-lg px-5 py-2">
                        {selectedResponse.sqdAvg.toFixed(2)} / 5.00
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Citizen's Charter Responses */}
              <div>
                <h4 className="text-primary mb-4 flex items-center gap-2">
                  <FileCheck className="w-4 h-4" />
                  Citizen's Charter (CC)
                </h4>
                <div className="space-y-2">
                  {questions.filter(q => {
                    // Only show CC questions that exist in the response
                    return q.category === 'CC' && (selectedResponse[q.id as keyof SurveyResponse] !== undefined);
                  }).map((question) => {
                    const value = selectedResponse[question.id as keyof SurveyResponse] as string;
                    if (!value) return null;
                    
                    return (
                      <div key={question.id} className="p-4 bg-white border border-border rounded-lg">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <Badge variant="outline" className="text-xs font-mono">{question.id.toUpperCase()}</Badge>
                            <p className="text-sm text-muted-foreground flex-1">{question.text}</p>
                          </div>
                          <div className="pl-16">
                            <p className="text-sm font-medium">{question.choices ? question.choices[parseInt(value) - 1] : value}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Feedback */}
              {selectedResponse.suggestions && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-primary mb-4 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Additional Feedback
                    </h4>
                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <p className="text-sm leading-relaxed">{selectedResponse.suggestions}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Contact */}
              {selectedResponse.email && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-primary mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Contact Information
                    </h4>
                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                      <p className="text-sm font-mono">{selectedResponse.email}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add New User
            </DialogTitle>
            <DialogDescription>Create a new admin or staff account</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="new-user-name">Full Name</Label>
              <Input
                id="new-user-name"
                value={newUserForm.name}
                onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-user-email">Email Address</Label>
              <Input
                id="new-user-email"
                type="email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-user-role">Role</Label>
              <Select value={newUserForm.role} onValueChange={(value) => setNewUserForm({ ...newUserForm, role: value })}>
                <SelectTrigger id="new-user-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Enumerator">Enumerator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-user-password">Password</Label>
              <Input
                id="new-user-password"
                type="password"
                value={newUserForm.password}
                onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                required
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setAddUserOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-secondary hover:bg-secondary/90">
                Add User
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" />
              Edit User
            </DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleEditUser} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-user-name">Full Name</Label>
                <Input 
                  id="edit-user-name" 
                  value={editUserForm.name} 
                  onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-user-email">Email Address</Label>
                <Input id="edit-user-email" type="email" value={selectedUser.email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-user-role">Role</Label>
                <Select value={editUserForm.role} onValueChange={(value) => setEditUserForm({ ...editUserForm, role: value as any })}>
                  <SelectTrigger id="edit-user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                    <SelectItem value="Enumerator">Enumerator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-user-status">Status</Label>
                <Select value={editUserForm.status} onValueChange={(value) => setEditUserForm({ ...editUserForm, status: value as any })}>
                  <SelectTrigger id="edit-user-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditUserOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-secondary hover:bg-secondary/90">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Initial Dialog */}
      <Dialog open={deleteUserOpen} onOpenChange={setDeleteUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Review the user information before deleting.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedUser.name}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                <p className="text-sm text-muted-foreground mt-1">Role: {selectedUser.role}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setDeleteUserOpen(false); setSelectedUser(null); }} className="flex-1">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteUser} className="flex-1">
                  Continue to Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={deleteUserConfirmOpen} onOpenChange={setDeleteUserConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Confirm User Deletion
            </DialogTitle>
            <DialogDescription>
              Are you absolutely sure? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium mb-2">
                  ⚠️ This will permanently delete:
                </p>
                <ul className="text-sm text-red-700 space-y-1 ml-4">
                  <li>• User: <strong>{selectedUser.name}</strong></li>
                  <li>• Email: <strong>{selectedUser.email}</strong></li>
                  <li>• Role: <strong>{selectedUser.role}</strong></li>
                </ul>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setDeleteUserConfirmOpen(false); setDeleteUserOpen(true); }} className="flex-1">
                  Go Back
                </Button>
                <Button variant="destructive" onClick={confirmDeleteUser} className="flex-1">
                  Yes, Delete User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Question Dialog */}
      <Dialog open={addQuestionOpen} onOpenChange={setAddQuestionOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add New Question
            </DialogTitle>
            <DialogDescription>Create a new survey question</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddQuestion} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="new-question-id">Question ID</Label>
              <Input
                id="new-question-id"
                placeholder="e.g., sqd9 or cc4"
                value={newQuestionForm.id}
                onChange={(e) => setNewQuestionForm({ ...newQuestionForm, id: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">Use format: sqd# for Service Quality or cc# for Citizen's Charter</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-question-text">Question Text</Label>
              <Textarea
                id="new-question-text"
                rows={3}
                value={newQuestionForm.text}
                onChange={(e) => setNewQuestionForm({ ...newQuestionForm, text: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-question-type">Question Type</Label>
              <Select value={newQuestionForm.type} onValueChange={(value: 'Likert' | 'Radio' | 'Text') => setNewQuestionForm({ ...newQuestionForm, type: value, choices: value === 'Radio' ? [''] : [] })}>
                <SelectTrigger id="new-question-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Likert">Likert Scale (1-5 + N/A)</SelectItem>
                  <SelectItem value="Radio">Radio Buttons (Custom Choices)</SelectItem>
                  <SelectItem value="Text">Text Input</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Choice Management for Radio Type */}
            {newQuestionForm.type === 'Radio' && (
              <div className="space-y-2">
                <Label>Radio Button Choices</Label>
                <div className="space-y-2">
                  {newQuestionForm.choices.map((choice, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Choice ${index + 1}`}
                        value={choice}
                        onChange={(e) => {
                          const newChoices = [...newQuestionForm.choices];
                          newChoices[index] = e.target.value;
                          setNewQuestionForm({ ...newQuestionForm, choices: newChoices });
                        }}
                        required
                      />
                      {newQuestionForm.choices.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newChoices = newQuestionForm.choices.filter((_, i) => i !== index);
                            setNewQuestionForm({ ...newQuestionForm, choices: newChoices });
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewQuestionForm({ ...newQuestionForm, choices: [...newQuestionForm.choices, ''] });
                    }}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Choice
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Add at least 2 choices for radio buttons</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="new-question-category">Category</Label>
              <Select value={newQuestionForm.category} onValueChange={(value: 'SQD' | 'CC') => setNewQuestionForm({ ...newQuestionForm, category: value })}>
                <SelectTrigger id="new-question-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SQD">Service Quality Dimensions (SQD)</SelectItem>
                  <SelectItem value="CC">Citizen's Charter (CC)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {newQuestionForm.category === 'SQD' 
                  ? 'Questions about service satisfaction and quality' 
                  : 'Questions about awareness and understanding of the Citizen\'s Charter'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="new-question-required"
                checked={newQuestionForm.required}
                onChange={(e) => setNewQuestionForm({ ...newQuestionForm, required: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="new-question-required">Required Question</Label>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setAddQuestionOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-secondary hover:bg-secondary/90">
                Add Question
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={editQuestionOpen} onOpenChange={setEditQuestionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" />
              Edit Question
            </DialogTitle>
            <DialogDescription>Update question details</DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <form onSubmit={handleEditQuestion} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Question ID</Label>
                <Input value={selectedQuestion.id} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-question-text">Question Text</Label>
                <Textarea id="edit-question-text" name="text" rows={3} defaultValue={selectedQuestion.text} required />
              </div>
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Input value={selectedQuestion.type} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Question type cannot be changed after creation</p>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={selectedQuestion.category === 'SQD' ? 'Service Quality Dimensions' : "Citizen's Charter"} disabled className="bg-muted" />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-question-required"
                  name="required"
                  defaultChecked={selectedQuestion.required}
                  value="true"
                  className="w-4 h-4"
                />
                <Label htmlFor="edit-question-required">Required Question</Label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditQuestionOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-secondary hover:bg-secondary/90">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Question Initial Dialog */}
      <Dialog open={deleteQuestionOpen} onOpenChange={setDeleteQuestionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete Question
            </DialogTitle>
            <DialogDescription>
              Review the question information before deleting.
            </DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{selectedQuestion.id.toUpperCase()}</Badge>
                  <Badge className={selectedQuestion.category === 'SQD' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                    {selectedQuestion.category}
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-800">{selectedQuestion.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedQuestion.text}</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setDeleteQuestionOpen(false); setSelectedQuestion(null); }} className="flex-1">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteQuestion} className="flex-1">
                  Continue to Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Question Confirmation Dialog */}
      <Dialog open={deleteQuestionConfirmOpen} onOpenChange={setDeleteQuestionConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Confirm Question Deletion
            </DialogTitle>
            <DialogDescription>
              Are you absolutely sure? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium mb-2">
                  ⚠️ This will permanently delete:
                </p>
                <ul className="text-sm text-red-700 space-y-1 ml-4">
                  <li>• Question ID: <strong>{selectedQuestion.id.toUpperCase()}</strong></li>
                  <li>• Category: <strong>{selectedQuestion.category === 'SQD' ? 'Service Quality Dimensions' : "Citizen's Charter"}</strong></li>
                  <li>• Type: <strong>{selectedQuestion.type}</strong></li>
                </ul>
                <p className="text-sm text-red-800 font-medium mt-3">
                  This will affect the survey form and may impact existing responses.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setDeleteQuestionConfirmOpen(false); setDeleteQuestionOpen(true); }} className="flex-1">
                  Go Back
                </Button>
                <Button variant="destructive" onClick={confirmDeleteQuestion} className="flex-1">
                  Yes, Delete Question
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrCodeOpen} onOpenChange={setQrCodeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img src={ArtaSurveyImage} alt="ARTA Survey" className="w-5 h-5" />
              Survey QR Code
            </DialogTitle>
            <DialogDescription>
              Display this QR code for citizens to access the survey
            </DialogDescription>
          </DialogHeader>
          <div className="py-8">
            <div className="bg-muted rounded-xl p-8 flex items-center justify-center border-2 border-dashed border-primary">
              <div className="bg-white p-6 rounded-lg shadow-xl">
                <img src={ArtaSurveyImage} alt="ARTA Survey QR" className="w-40 h-40" />
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <Button className="w-full" onClick={() => handleExport('QR Code')}>
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
              <Button variant="outline" className="w-full" onClick={() => window.print()}>
                <FileText className="w-4 h-4 mr-2" />
                Print QR Code
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Update your account password
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={changePasswordForm.current}
                onChange={(e) => setChangePasswordForm({ ...changePasswordForm, current: e.target.value })}
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={changePasswordForm.new}
                onChange={(e) => setChangePasswordForm({ ...changePasswordForm, new: e.target.value })}
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={changePasswordForm.confirm}
                onChange={(e) => setChangePasswordForm({ ...changePasswordForm, confirm: e.target.value })}
                required
                className="h-12"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setChangePasswordOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-secondary hover:bg-secondary/90">
                Change Password
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add User Confirmation Dialog */}
      <Dialog open={addUserConfirmOpen} onOpenChange={setAddUserConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Confirm Add User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to add this user to the system?
            </DialogDescription>
          </DialogHeader>
          {pendingUserData && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <span className="font-medium">{pendingUserData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="font-medium">{pendingUserData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Role:</span>
                  <Badge variant="outline">{pendingUserData.role}</Badge>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setAddUserConfirmOpen(false); setAddUserOpen(true); }} className="flex-1">
                  Go Back
                </Button>
                <Button onClick={confirmAddUser} className="flex-1 bg-secondary hover:bg-secondary/90">
                  Confirm Add User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Confirmation Dialog */}
      <Dialog open={editUserConfirmOpen} onOpenChange={setEditUserConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Confirm Update User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to update this user's information?
            </DialogDescription>
          </DialogHeader>
          {pendingUserEdit && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <span className="font-medium">{pendingUserEdit.updates.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="font-medium">{pendingUserEdit.updates.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Role:</span>
                  <Badge variant="outline">{pendingUserEdit.updates.role}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge className={pendingUserEdit.updates.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {pendingUserEdit.updates.status}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setEditUserConfirmOpen(false); setEditUserOpen(true); }} className="flex-1">
                  Go Back
                </Button>
                <Button onClick={confirmEditUser} className="flex-1 bg-secondary hover:bg-secondary/90">
                  Confirm Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Confirmation Dialog */}
      <Dialog open={exportConfirmOpen} onOpenChange={setExportConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Confirm Export
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to export {exportType}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 leading-relaxed">
                <strong>Note:</strong> This will download {exportType.toLowerCase()} containing sensitive data. Please handle it securely and in accordance with data privacy regulations.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setExportConfirmOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={confirmExport} className="flex-1 bg-secondary hover:bg-secondary/90">
                <Download className="w-4 h-4 mr-2" />
                Export Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Kiosk Mode Confirmation Modal */}
      <Dialog open={kioskModeConfirmOpen} onOpenChange={setKioskModeConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              Enable Kiosk Mode?
            </DialogTitle>
            <DialogDescription>
              This will transform the survey interface for kiosk displays
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Kiosk Mode Features:</h4>
              <ul className="text-sm text-blue-800 leading-relaxed space-y-1.5 list-disc list-inside">
                <li>Fullscreen interface for immersive experience</li>
                <li>Auto-advance through questions after selection</li>
                <li>Auto-reset after survey submission</li>
                <li>Idle timeout with automatic reset</li>
                <li>Optimized for touch screen displays</li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 leading-relaxed">
                <strong>Note:</strong> The survey will continuously loop and reset for the next user. Pair with OS-level kiosk mode for complete device lockdown.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setKioskModeConfirmOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={confirmKioskMode} className="flex-1 bg-primary hover:bg-primary/90">
                <Monitor className="w-4 h-4 mr-2" />
                Enable Kiosk Mode
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Order Confirmation Dialog */}
      <Dialog open={saveOrderConfirmOpen} onOpenChange={setSaveOrderConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Save Question Order?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to save the new question order?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 leading-relaxed">
                <strong>Note:</strong> This will permanently change the order in which questions appear in the survey form. The changes will apply to all future survey responses.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSaveOrderConfirmOpen(false)} className="flex-1">
                No, Cancel
              </Button>
              <Button onClick={confirmSaveOrder} className="flex-1 bg-primary hover:bg-primary/90">
                <CheckCircle className="w-4 h-4 mr-2" />
                Yes, Save Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Warning Dialog */}
      <Dialog open={unsavedChangesWarningOpen} onOpenChange={setUnsavedChangesWarningOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Unsaved Changes
            </DialogTitle>
            <DialogDescription>
              You have unsaved changes to the question order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 leading-relaxed">
                <strong>Warning:</strong> If you leave this page without saving, your changes to the question order will be lost. Would you like to save before continuing?
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={saveAndContinue} className="w-full bg-primary hover:bg-primary/90">
                <CheckCircle className="w-4 h-4 mr-2" />
                Yes, Save and Continue
              </Button>
              <Button variant="outline" onClick={discardChanges} className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                No, Discard Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Success Modal */}
      <Dialog open={actionSuccessOpen} onOpenChange={setActionSuccessOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Success
            </DialogTitle>
            <DialogDescription>
              Action completed successfully
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <p className="text-sm text-green-800 leading-relaxed">
                {actionSuccessMessage}
              </p>
            </div>
            <Button onClick={() => setActionSuccessOpen(false)} className="w-full bg-secondary hover:bg-secondary/90">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Error Modal */}
      <Dialog open={actionErrorOpen} onOpenChange={setActionErrorOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="w-5 h-5" />
              Error
            </DialogTitle>
            <DialogDescription>
              Action could not be completed
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-sm text-red-800 leading-relaxed">
                {actionErrorMessage}
              </p>
            </div>
            <Button onClick={() => setActionErrorOpen(false)} className="w-full bg-destructive hover:bg-destructive/90">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
