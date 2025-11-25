import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { SurveyForm } from './components/SurveyForm';
import { AdminDashboard } from './components/AdminDashboard';
import { KioskLandingScreen } from './components/KioskLandingScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { subscribeToQuestions, addQuestion, updateQuestion, deleteQuestion, reorderQuestions, questionsExist, syncAllQuestions } from './services/questionService';
import './firebase';

// Types
export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'Likert' | 'Radio' | 'Text';
  required: boolean;
  category: 'CC' | 'SQD';
  choices?: string[];
  order: number;
}

export interface SurveyResponse {
  id: number;
  refId: string;
  date: string;
  clientType: string;
  sex: string;
  age: string;
  region: string;
  service: string;
  serviceOther?: string;
  cc1: string;
  cc2: string;
  cc3: string;
  sqd0: string;
  sqd1: string;
  sqd2: string;
  sqd3: string;
  sqd4: string;
  sqd5: string;
  sqd6: string;
  sqd7: string;
  sqd8: string;
  sqdAvg: number;
  suggestions: string;
  email: string;
  timestamp: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

function AppContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<'landing' | 'survey' | 'admin'>('landing');
  const [kioskMode, setKioskMode] = useState(false);

  // Survey Questions State
  const [questions, setQuestions] = useState<SurveyQuestion[]>([
    { id: 'sqd0', text: 'I am satisfied with the service that I availed.', type: 'Likert', required: true, category: 'SQD', order: 1 },
    { id: 'sqd1', text: 'I spent a reasonable amount of time for my transaction.', type: 'Likert', required: true, category: 'SQD', order: 2 },
    { id: 'sqd2', text: 'The office followed the transaction\'s requirements and steps based on the information provided.', type: 'Likert', required: true, category: 'SQD', order: 3 },
    { id: 'sqd3', text: 'The steps (including payment) I needed to do for my transaction were easy and simple.', type: 'Likert', required: true, category: 'SQD', order: 4 },
    { id: 'sqd4', text: 'I easily found information about my transaction from the office or its website.', type: 'Likert', required: true, category: 'SQD', order: 5 },
    { id: 'sqd5', text: 'I paid a reasonable amount of fees for my transaction. (If service was free, mark the \'N/A\' column.)', type: 'Likert', required: true, category: 'SQD', order: 6 },
    { id: 'sqd6', text: 'I feel the office was fair to everyone, or "walang palakasan", during my transaction.', type: 'Likert', required: true, category: 'SQD', order: 7 },
    { id: 'sqd7', text: 'I was treated courteously by the staff, and (if asked for help) the staff was helpful.', type: 'Likert', required: true, category: 'SQD', order: 8 },
    { id: 'sqd8', text: 'I got what I needed from the government office, or (if denied) denial of request was sufficiently explained to me.', type: 'Likert', required: true, category: 'SQD', order: 9 },
    { 
      id: 'cc1', 
      text: 'Which of the following best describes your awareness of a Citizen\'s Charter?', 
      type: 'Radio', 
      required: true, 
      category: 'CC',
      choices: [
        '1. I know what a CC is and I saw this office\'s CC.',
        '2. I know what a CC is but I did NOT see this office\'s CC.',
        '3. I learned of the CC only when I saw this office\'s CC.',
        '4. I do not know what a CC is and I did not see one in this office.'
      ],
      order: 10
    },
    { 
      id: 'cc2', 
      text: 'If aware of CC, would you say that the CC of this office was...?', 
      type: 'Radio', 
      required: true, 
      category: 'CC',
      choices: [
        '1. Easy to see',
        '2. Somewhat easy to see',
        '3. Difficult to see',
        '4. Not visible at all',
        '5. N/A'
      ],
      order: 11
    },
    { 
      id: 'cc3', 
      text: 'If aware of CC (answered 1-3 in CC1), how much did the CC help you in your transaction?', 
      type: 'Radio', 
      required: true, 
      category: 'CC',
      choices: [
        '1. Helped very much',
        '2. Somewhat helped',
        '3. Did not help',
        '4. N/A'
      ],
      order: 12
    },
  ]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  // Survey Responses State
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [responsesLoading, setResponsesLoading] = useState(true);

  // Load responses from Firebase on mount and listen for changes
  useEffect(() => {
    const db = getFirestore();
    const responsesRef = collection(db, 'responses');
    const q = query(responsesRef, orderBy('timestamp', 'desc'));
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const loadedResponses: SurveyResponse[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          loadedResponses.push({
            id: loadedResponses.length + 1,
            refId: data.refId || doc.id,
            date: data.date || new Date().toISOString().split('T')[0],
            clientType: data.clientType || '',
            sex: data.sex || '',
            age: data.age || '',
            region: data.region || '',
            service: data.service || '',
            serviceOther: data.serviceOther || '',
            cc1: data.cc1 || '',
            cc2: data.cc2 || '',
            cc3: data.cc3 || '',
            sqd0: data.sqd0 || '',
            sqd1: data.sqd1 || '',
            sqd2: data.sqd2 || '',
            sqd3: data.sqd3 || '',
            sqd4: data.sqd4 || '',
            sqd5: data.sqd5 || '',
            sqd6: data.sqd6 || '',
            sqd7: data.sqd7 || '',
            sqd8: data.sqd8 || '',
            sqdAvg: data.sqdAvg || 0,
            suggestions: data.suggestions || '',
            email: data.email || '',
            timestamp: data.timestamp || Date.now()
          });
        });
        setResponses(loadedResponses);
        setResponsesLoading(false);
      } catch (error) {
        console.error('Error loading responses from Firebase:', error);
        setResponsesLoading(false);
      }
    }, (error) => {
      console.error('Error setting up responses listener:', error);
      setResponsesLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load and subscribe to questions from Firestore
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const loadQuestions = async () => {
      try {
        setQuestionsLoading(true);
        
        // Check if questions exist in Firestore
        const exists = await questionsExist();
        
        if (!exists) {
          // If no questions in Firestore, sync the default questions
          console.log('📋 Syncing default questions to Firestore...');
          await syncAllQuestions(questions);
        }
        
        // Subscribe to real-time updates
        unsubscribe = subscribeToQuestions(
          (loadedQuestions) => {
            console.log('📋 Questions loaded from Firestore:', loadedQuestions.length);
            setQuestions(loadedQuestions);
            setQuestionsLoading(false);
            setQuestionsError(null);
          },
          (error) => {
            console.error('Error with questions subscription:', error);
            setQuestionsError(error?.message || 'Failed to load questions');
            setQuestionsLoading(false);
          }
        );
      } catch (error) {
        console.error('Error loading questions:', error);
        setQuestionsError(error instanceof Error ? error.message : 'Failed to load questions');
        setQuestionsLoading(false);
      }
    };

    loadQuestions();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Users State
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'Admin User', email: 'admin@valenzuela.gov.ph', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Staff Member', email: 'staff@valenzuela.gov.ph', role: 'Staff', status: 'Active' },
    { id: 3, name: 'Enumerator', email: 'enumerator@valenzuela.gov.ph', role: 'Enumerator', status: 'Active' },
  ]);

  // Check for kiosk mode on mount
  useEffect(() => {
    const isKioskMode = localStorage.getItem('kioskMode') === 'true';
    setKioskMode(isKioskMode);
  }, []);

  // Listen for kiosk mode changes
  useEffect(() => {
    const handleStorageChange = () => {
      const isKioskMode = localStorage.getItem('kioskMode') === 'true';
      setKioskMode(isKioskMode);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('kioskModeChange', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('kioskModeChange', handleStorageChange);
    };
  }, []);

  // Emergency keyboard shortcut to disable kiosk mode (Ctrl+Shift+K)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+Shift+K to disable kiosk mode
      if (e.ctrlKey && e.shiftKey && (e.key === 'K' || e.key === 'k')) {
        localStorage.removeItem('kioskMode');
        setKioskMode(false);
        window.dispatchEvent(new Event('kioskModeChange'));
        console.log('🔓 Kiosk mode disabled via keyboard shortcut');
        alert('Kiosk mode has been disabled!');
      }
      
      // Ctrl+Shift+A to access admin (even in kiosk mode)
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        console.log('🔐 Admin access via keyboard shortcut');
        setView('admin');
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Redirect to admin if user is logged in and auth is done loading
  useEffect(() => {
    if (!loading && user) {
      setView('admin');
    }
  }, [user, loading]);

  // Handlers for Admin Dashboard
  const handleAddQuestion = async (question: SurveyQuestion) => {
    const originalQuestions = questions;
    try {
      // Optimistic update: update local state immediately for instant feedback
      const newQuestion = { ...question, order: Math.max(...questions.map(q => q.order), 0) + 1 };
      setQuestions([...questions, newQuestion]);
      
      // Then save to Firebase (async, no need to block UI)
      await addQuestion(newQuestion);
      console.log('✅ Question added to Firebase');
    } catch (error) {
      console.error('Failed to add question:', error);
      // Revert optimistic update on failure
      setQuestions(originalQuestions);
      throw error;
    }
  };

  const handleUpdateQuestion = async (id: string, updates: Partial<SurveyQuestion>) => {
    const originalQuestions = questions;
    try {
      // Optimistic update: update local state immediately for instant feedback
      setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
      
      // Then save to Firebase (async, no need to block UI)
      await updateQuestion(id, updates);
      console.log('✅ Question updated in Firebase');
    } catch (error) {
      console.error('Failed to update question:', error);
      // Revert optimistic update on failure
      setQuestions(originalQuestions);
      throw error;
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    const originalQuestions = questions;
    try {
      // Optimistic update: remove from local state immediately for instant feedback
      setQuestions(questions.filter(q => q.id !== id));
      
      // Then delete from Firebase (async, no need to block UI)
      await deleteQuestion(id);
      console.log('✅ Question deleted from Firebase');
    } catch (error) {
      console.error('Failed to delete question:', error);
      // Revert optimistic update on failure
      setQuestions(originalQuestions);
      throw error;
    }
  };

  const handleReorderQuestions = async (reorderedQuestions: SurveyQuestion[]) => {
    const originalQuestions = questions;
    try {
      // Optimistic update: update local state immediately for instant feedback
      setQuestions(reorderedQuestions);
      
      // Then save to Firebase (async, no need to block UI)
      await reorderQuestions(reorderedQuestions);
      console.log('✅ Questions reordered in Firebase');
    } catch (error) {
      console.error('Failed to reorder questions:', error);
      // Revert optimistic update on failure
      setQuestions(originalQuestions);
      throw error;
    }
  };

  const handleAddUser = (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: Math.max(...users.map(u => u.id), 0) + 1 };
    setUsers([...users, newUser]);
  };

  const handleUpdateUser = (id: number, updates: Partial<User>) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handleSubmitResponse = async (response: Omit<SurveyResponse, 'id' | 'timestamp'>) => {
    const db = getFirestore();
    try {
      const docRef = await addDoc(collection(db, "responses"), {
        ...response,
        timestamp: Date.now(),
      });
      console.log("Document written with ID: ", docRef.id);
      // No need to update local state - the real-time listener will handle it
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div className="min-h-screen">
      {loading || responsesLoading || questionsLoading ? (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="text-center space-y-4">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-muted-foreground">Loading your session...</p>
          </div>
        </div>
      ) : (
        <>
        {view === 'landing' && !kioskMode && (
          <LandingPage 
            onTakeSurvey={() => setView('survey')} 
            onAdminLogin={() => setView('admin')}
            responses={responses}
            kioskMode={kioskMode}
          />
        )}
        {view === 'landing' && kioskMode && (
          <KioskLandingScreen 
            onStartSurvey={() => setView('survey')}
          />
        )}
        {view === 'survey' && (
          <SurveyForm 
            onBackToLanding={() => setView('landing')}
            questions={questions}
            onSubmitResponse={handleSubmitResponse}
            kioskMode={kioskMode}
          />
        )}
        {view === 'admin' && (
          <AdminDashboard 
            responses={responses}
            questions={questions}
            users={users}
            onAddQuestion={handleAddQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onReorderQuestions={handleReorderQuestions}
            onLogout={() => setView('landing')}
          />
        )}
        </>
      )}
      </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
