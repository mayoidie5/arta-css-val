import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { CheckCircle2, XCircle, Frown, Meh, Smile, Star, MinusCircle, FileText, LayoutDashboard, ArrowLeft, Home, User, Award, MessageSquare, FileCheck, AlertCircle, Plus, Minus } from 'lucide-react';
import { SurveyQuestion } from '../App';
import valenzuelaLogo from 'figma:asset/3da91e378b5746d28e242948a192281543f29d21.png';
import { CustomDatePicker } from './CustomDatePicker';
import { TouchKeyboard } from './TouchKeyboard';

interface SurveyFormProps {
  onBackToLanding?: () => void;
  questions: SurveyQuestion[];
  onSubmitResponse: (response: any) => void;
  kioskMode?: boolean;
}

export function SurveyForm({ onBackToLanding, questions, onSubmitResponse, kioskMode = false }: SurveyFormProps) {
  const [kioskOrientation, setKioskOrientation] = useState<'landscape' | 'portrait'>('landscape');
  
  // Touch keyboard state for kiosk mode
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [keyboardType, setKeyboardType] = useState<'text' | 'number' | 'email'>('text');
  const activeInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Debug: Log kiosk mode status and scroll to top
  useEffect(() => {
    console.log('🖥️ SurveyForm - Kiosk Mode:', kioskMode);
    console.log('📦 localStorage kioskMode:', localStorage.getItem('kioskMode'));
    
    // Scroll to the very top when component mounts
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Load orientation from localStorage
    const savedOrientation = localStorage.getItem('kioskOrientation') as 'landscape' | 'portrait' | null;
    if (savedOrientation) {
      setKioskOrientation(savedOrientation);
    }

    // Listen for orientation changes
    const handleOrientationChange = () => {
      const newOrientation = localStorage.getItem('kioskOrientation') as 'landscape' | 'portrait' | null;
      if (newOrientation) {
        setKioskOrientation(newOrientation);
      }
    };

    window.addEventListener('kioskOrientationChange', handleOrientationChange);
    return () => window.removeEventListener('kioskOrientationChange', handleOrientationChange);
  }, [kioskMode]);

  const handleBackToLanding = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (onBackToLanding) {
      onBackToLanding();
    }
  };

  // Initialize formData with dynamic question IDs
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initialData: Record<string, string> = {
      clientType: '',
      date: '',
      sex: '',
      age: kioskMode ? '18' : '', // Default to 18 in kiosk mode for easier input
      region: '',
      service: '',
      serviceOther: '',
      suggestions: '',
      email: ''
    };
    
    // Add all question IDs dynamically
    questions.forEach(q => {
      initialData[q.id] = '';
    });
    
    return initialData;
  });

  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [activeSection, setActiveSection] = useState('client-info');

  const generateReferenceId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `VZM-CSM-${timestamp}-${random}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      // Try modern Clipboard API first
      await navigator.clipboard.writeText(text);
      alert('Reference ID copied to clipboard!');
    } catch (err) {
      // Fallback: Create a temporary input element
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        alert('Reference ID copied to clipboard!');
      } catch (execErr) {
        // If all else fails, show the text in an alert so user can copy manually
        alert(`Please copy your Reference ID:\n\n${text}`);
      }
      
      document.body.removeChild(textArea);
    }
  };

  // Touch keyboard handlers for kiosk mode
  const handleInputFocus = (fieldName: string, type: 'text' | 'number' | 'email', inputRef: HTMLInputElement | HTMLTextAreaElement) => {
    if (kioskMode) {
      setActiveInput(fieldName);
      setKeyboardType(type);
      activeInputRef.current = inputRef;
      
      // Scroll input into view after a small delay to account for keyboard appearing
      setTimeout(() => {
        inputRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const handleKeyboardKeyPress = (key: string) => {
    if (activeInput && activeInputRef.current) {
      const currentValue = formData[activeInput] || '';
      updateField(activeInput, currentValue + key);
    }
  };

  const handleKeyboardBackspace = () => {
    if (activeInput && activeInputRef.current) {
      const currentValue = formData[activeInput] || '';
      updateField(activeInput, currentValue.slice(0, -1));
    }
  };

  const handleKeyboardClose = () => {
    setActiveInput(null);
    activeInputRef.current = null;
  };

  const calculateSQDAverage = () => {
    const sqdQuestions = questions.filter(q => q.category === 'SQD');
    const sqdValues = sqdQuestions
      .map(q => formData[q.id as keyof typeof formData])
      .filter(val => val && val !== 'na')
      .map(val => parseInt(val as string));
    
    if (sqdValues.length === 0) return 0;
    return sqdValues.reduce((a, b) => a + b, 0) / sqdValues.length;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const refId = generateReferenceId();
    setReferenceId(refId);
    
    // Build response object dynamically
    const response: any = {
      refId,
      date: formData.date,
      clientType: formData.clientType.charAt(0).toUpperCase() + formData.clientType.slice(1),
      sex: formData.sex,
      age: formData.age,
      region: formData.region,
      service: formData.service,
      serviceOther: formData.serviceOther,
      sqdAvg: calculateSQDAverage(),
      suggestions: formData.suggestions,
      email: formData.email,
    };
    
    // Add all question responses dynamically
    questions.forEach(q => {
      response[q.id] = formData[q.id] || '';
    });
    
    onSubmitResponse(response);
    setSubmitted(true);
  };

  const handleNewResponse = () => {
    const resetData: Record<string, string> = {
      clientType: '',
      date: '',
      sex: '',
      age: kioskMode ? '18' : '', // Default to 18 in kiosk mode
      region: '',
      service: '',
      serviceOther: '',
      suggestions: '',
      email: ''
    };
    
    // Reset all question IDs
    questions.forEach(q => {
      resetData[q.id] = '';
    });
    
    setFormData(resetData);
    setSubmitted(false);
    setReferenceId('');
    setActiveSection('client-info');
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Update formData when questions change (e.g., new questions added)
  useEffect(() => {
    setFormData(prev => {
      const updated = { ...prev };
      questions.forEach(q => {
        if (!(q.id in updated)) {
          updated[q.id] = '';
        }
      });
      return updated;
    });
  }, [questions]);

  // Kiosk mode: Auto-reset after submission
  useEffect(() => {
    if (kioskMode && submitted) {
      const timer = setTimeout(() => {
        handleNewResponse();
      }, 8000); // Reset after 8 seconds
      return () => clearTimeout(timer);
    }
  }, [kioskMode, submitted]);

  // Calculate progress based on filled required fields (accounting for conditional fields)
  const getRequiredFields = () => {
    const baseRequired = ['clientType', 'date', 'sex', 'age', 'region', 'service'];
    
    // Add serviceOther if service is "other"
    if (formData.service === 'other') {
      baseRequired.push('serviceOther');
    }
    
    // Add all required questions dynamically
    questions.forEach(q => {
      if (q.required) {
        baseRequired.push(q.id);
      }
    });
    
    return baseRequired;
  };

  const requiredFields = getRequiredFields();
  const filledFields = requiredFields.filter(field => formData[field as keyof typeof formData]).length;
  const progress = (filledFields / requiredFields.length) * 100;
  const isFormComplete = progress === 100;

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['client-info', 'cc-section', 'sqd-section', 'feedback-section'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run once on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (submitted) {
    // Kiosk Mode Success Screen - Same as regular but with auto-return and no reference ID
    if (kioskMode) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full shadow-[0_20px_60px_rgba(0,0,0,0.15)] border-2 border-green-200 bg-white">
            <CardContent className="pt-12 pb-10 px-8">
              {/* Success Icon */}
              <div className="flex justify-center mb-8">
                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full w-28 h-28 flex items-center justify-center shadow-[0_10px_40px_rgba(34,197,94,0.4)] animate-in zoom-in duration-500">
                  <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={3} />
                </div>
              </div>

              {/* Success Message */}
              <div className="text-center mb-8">
                <h1 className="text-primary mb-3">
                  <strong>Submission Successful!</strong>
                </h1>
                <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
                  Thank you for taking the time to share your feedback with the <strong>City Government of Valenzuela</strong>. 
                  Your response has been successfully recorded and will help us improve our services.
                </p>
              </div>

              {/* Auto-Return Timer - Kiosk Only */}
              <div className="mb-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg text-center">
                <p className="text-lg text-primary animate-pulse">
                  <strong>⏱️ Returning to start in 8 seconds...</strong>
                </p>
              </div>

              {/* Action Button - Touch Optimized */}
              <div className="flex justify-center">
                <Button
                  onClick={handleNewResponse}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-[0_6px_20px_rgba(0,123,255,0.3)] hover:shadow-[0_8px_25px_rgba(0,123,255,0.4)] transition-all px-10 py-6 text-lg h-auto"
                  size="lg"
                >
                  <FileText className="w-6 h-6 mr-2" />
                  Submit Another Response
                </Button>
              </div>

              {/* Footer Note */}
              <div className="mt-8 pt-6 border-t border-border text-center">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your feedback is confidential and will be used solely for improving government services. 
                  Thank you for your participation in the <strong>Anti-Red Tape Authority (ARTA)</strong> compliance program.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Regular Success Screen (non-kiosk)
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-[0_20px_60px_rgba(0,0,0,0.15)] border-2 border-green-200 bg-white">
          <CardContent className="pt-12 pb-10 px-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full w-28 h-28 flex items-center justify-center shadow-[0_10px_40px_rgba(34,197,94,0.4)] animate-in zoom-in duration-500">
                <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={3} />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <h1 className="text-primary mb-3">
                <strong>Submission Successful!</strong>
              </h1>
              <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
                Thank you for taking the time to share your feedback with the <strong>City Government of Valenzuela</strong>. 
                Your response has been successfully recorded and will help us improve our services.
              </p>
            </div>

            {/* Reference ID Section */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 mb-8 shadow-md">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Submission Reference ID</p>
                  <p className="text-primary font-mono tracking-wide">
                    <strong>{referenceId}</strong>
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(referenceId)}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Copy ID
                </Button>
              </div>
              <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded">
                <p className="text-sm text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span><strong>Important:</strong> Please save this Reference ID now. You will not be able to access it again after leaving this page.</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {onBackToLanding && (
                <Button
                  onClick={handleBackToLanding}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-md hover:shadow-lg transition-all px-8 h-14"
                  size="lg"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Back to Home
                </Button>
              )}
              <Button
                onClick={handleNewResponse}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-[0_6px_20px_rgba(0,123,255,0.3)] hover:shadow-[0_8px_25px_rgba(0,123,255,0.4)] transition-all px-8 h-14"
                size="lg"
              >
                <FileText className="w-5 h-5 mr-2" />
                Submit Another Response
              </Button>
            </div>

            {/* Footer Note */}
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your feedback is confidential and will be used solely for improving government services. 
                Thank you for your participation in the <strong>Anti-Red Tape Authority (ARTA)</strong> compliance program.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Side Navigation Helper - Desktop */}
      <aside className="hidden lg:block w-64 bg-gradient-to-b from-[#F5F9FC] to-white border-r border-[#d1dae6] sticky top-0 h-screen overflow-y-auto">
          <div className="p-6 space-y-6">
            {onBackToLanding && (
              <Button 
                onClick={handleBackToLanding}
                variant="outline"
                className="w-full border-[#0D3B66] text-[#0D3B66] hover:bg-[#0D3B66] hover:text-white transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            )}
            <div className="space-y-2">
              <h3 className="text-sm !font-bold text-[#0D3B66]">Survey Sections</h3>
              <div className="space-y-1">
                <button 
                  onClick={() => {
                    const element = document.getElementById('client-info');
                    if (element) {
                      const headerOffset = 100;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all flex items-center gap-3 ${
                    activeSection === 'client-info' 
                      ? 'bg-[#0D3B66] text-white shadow-md' 
                      : 'text-[#0B172A]/70 hover:bg-[#E8EDF5] hover:text-[#0D3B66]'
                  }`}
                >
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span>Client Information</span>
                </button>
                <button 
                  onClick={() => {
                    const element = document.getElementById('cc-section');
                    if (element) {
                      const headerOffset = 100;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all flex items-center gap-3 ${
                    activeSection === 'cc-section' 
                      ? 'bg-[#0D3B66] text-white shadow-md' 
                      : 'text-[#0B172A]/70 hover:bg-[#E8EDF5] hover:text-[#0D3B66]'
                  }`}
                >
                  <FileCheck className="w-4 h-4 flex-shrink-0" />
                  <span>Citizen&apos;s Charter</span>
                </button>
                <button 
                  onClick={() => {
                    const element = document.getElementById('sqd-section');
                    if (element) {
                      const headerOffset = 100;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all flex items-center gap-3 ${
                    activeSection === 'sqd-section' 
                      ? 'bg-[#0D3B66] text-white shadow-md' 
                      : 'text-[#0B172A]/70 hover:bg-[#E8EDF5] hover:text-[#0D3B66]'
                  }`}
                >
                  <Award className="w-4 h-4 flex-shrink-0" />
                  <span>Service Quality</span>
                </button>
                <button 
                  onClick={() => {
                    const element = document.getElementById('feedback-section');
                    if (element) {
                      const headerOffset = 100;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all flex items-center gap-3 ${
                    activeSection === 'feedback-section' 
                      ? 'bg-[#0D3B66] text-white shadow-md' 
                      : 'text-[#0B172A]/70 hover:bg-[#E8EDF5] hover:text-[#0D3B66]'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span>Additional Feedback</span>
                </button>
              </div>
            </div>
            <div className="pt-4 border-t border-[#d1dae6]">
              <div className="bg-white rounded-lg p-4 space-y-2 border border-[#d1dae6] shadow-sm">
                <p className="text-xs !font-bold text-[#0D3B66]">Progress</p>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-[#5a6c84]">{Math.round(progress)}% Complete</p>
              </div>
            </div>
          </div>
        </aside>

      {/* Main Content */}
      <div className={`flex-1 min-h-screen ${kioskMode ? 'overflow-y-auto' : ''}`}>
        {/* Header */}
        <div className="bg-primary text-primary-foreground py-8 px-4 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
          <div className={`mx-auto ${kioskMode && kioskOrientation === 'portrait' ? 'max-w-xl' : 'max-w-3xl'}`}>
            {/* Back Button - Mobile - Hidden in Kiosk Mode */}
            {onBackToLanding && !kioskMode && (
              <div className="mb-6 lg:hidden">
                <Button 
                  onClick={onBackToLanding}
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            )}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-5">
                <img 
                  src={valenzuelaLogo} 
                  alt="Valenzuela City Seal" 
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h1 className="mb-3 !text-xl md:!text-2xl !font-bold">CITY GOVERNMENT OF VALENZUELA</h1>
              <h2 className="mb-0 !text-base md:!text-lg opacity-90">HELP US SERVE YOU BETTER!</h2>
            </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <p className="text-sm opacity-95 leading-relaxed">
              This <strong>Client Satisfaction Measurement (CSM)</strong> tracks the customer experience of government offices. Your feedback on your <em>recently concluded transaction</em> will help this office provide a better service. Personal information shared will be kept confidential and you always have the option to not answer this form.
            </p>
            </div>
          </div>
        </div>

        {/* Progress Bar - Mobile */}
        <div className="bg-white border-b border-border py-4 px-4 sticky top-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.08)] lg:hidden">
          <div className={`mx-auto ${kioskMode && kioskOrientation === 'portrait' ? 'max-w-lg' : 'max-w-2xl'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-primary">Survey Progress</span>
              <span className="text-sm text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className={`mx-auto px-4 py-12 space-y-10 ${kioskMode && kioskOrientation === 'portrait' ? 'max-w-xl' : 'max-w-3xl'}`}>
          {/* Client Information */}
          <Card id="client-info" className="shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-border">
            <CardHeader className="border-b border-border bg-muted/30 pb-5">
              <CardTitle className="text-primary">Client Information</CardTitle>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed italic">
                This Client Satisfaction Measurement (CSM) tracks the customer experience of government offices. Your feedback on your recently concluded transaction will help this office provide a better service. Personal information shared will be kept confidential and you always have the option to not answer this form.
              </p>
            </CardHeader>
            <CardContent className="space-y-7 pt-6">
            <div className="space-y-4">
              <Label htmlFor="clientType" className="text-primary">
                Client Type <span className="text-destructive">*</span>
              </Label>
              <RadioGroup value={formData.clientType} onValueChange={(value) => updateField('clientType', value)}>
                <Label 
                  htmlFor="citizen" 
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    formData.clientType === 'citizen' 
                      ? 'bg-secondary/10 border-secondary shadow-md' 
                      : 'bg-muted/50 border-border hover:border-secondary'
                  }`}
                >
                  <RadioGroupItem value="citizen" id="citizen" />
                  <span className="flex-1">Citizen</span>
                </Label>
                <Label 
                  htmlFor="business" 
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    formData.clientType === 'business' 
                      ? 'bg-secondary/10 border-secondary shadow-md' 
                      : 'bg-muted/50 border-border hover:border-secondary'
                  }`}
                >
                  <RadioGroupItem value="business" id="business" />
                  <span className="flex-1">Business</span>
                </Label>
                <Label 
                  htmlFor="government" 
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    formData.clientType === 'government' 
                      ? 'bg-secondary/10 border-secondary shadow-md' 
                      : 'bg-muted/50 border-border hover:border-secondary'
                  }`}
                >
                  <RadioGroupItem value="government" id="government" />
                  <span className="flex-1">Government (Employee or Another Agency)</span>
                </Label>
              </RadioGroup>
            </div>

            <CustomDatePicker
              value={formData.date}
              onChange={(date) => updateField('date', date)}
              label="Date"
              required
              maxDate={new Date()}
            />

            <div className="space-y-4">
              <Label htmlFor="sex" className="text-primary">
                Sex <span className="text-destructive">*</span>
              </Label>
              <RadioGroup value={formData.sex} onValueChange={(value) => updateField('sex', value)}>
                <div className="flex gap-4">
                  <Label 
                    htmlFor="male" 
                    className={`flex items-center space-x-3 p-4 rounded-lg flex-1 border-2 transition-all cursor-pointer ${
                      formData.sex === 'male' 
                        ? 'bg-secondary/10 border-secondary shadow-md' 
                        : 'bg-muted/50 border-border hover:border-secondary'
                    }`}
                  >
                    <RadioGroupItem value="male" id="male" />
                    <span>Male</span>
                  </Label>
                  <Label 
                    htmlFor="female" 
                    className={`flex items-center space-x-3 p-4 rounded-lg flex-1 border-2 transition-all cursor-pointer ${
                      formData.sex === 'female' 
                        ? 'bg-secondary/10 border-secondary shadow-md' 
                        : 'bg-muted/50 border-border hover:border-secondary'
                    }`}
                  >
                    <RadioGroupItem value="female" id="female" />
                    <span>Female</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label htmlFor="age" className="text-primary">
                Age <span className="text-destructive">*</span>
              </Label>
              {kioskMode ? (
                <div className="space-y-3">
                  {/* Touch-friendly age input with number pad */}
                  <div 
                    className="flex items-center justify-center bg-white border-2 border-primary/30 rounded-lg p-6 cursor-pointer hover:border-primary transition-colors shadow-sm"
                    onClick={(e) => {
                      const input = (e.currentTarget.querySelector('input') as HTMLInputElement);
                      if (input) {
                        handleInputFocus('age', 'number', input);
                      }
                    }}
                  >
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-2">Tap to enter age</div>
                      <input
                        type="text"
                        inputMode="none"
                        value={formData.age || ''}
                        onChange={(e) => updateField('age', e.target.value)}
                        className="text-4xl font-mono text-primary text-center w-full bg-transparent border-none outline-none cursor-pointer"
                        placeholder="--"
                        readOnly
                      />
                    </div>
                  </div>
                  {/* Quick Select Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {[18, 25, 35, 45, 55, 65, 75, 85].map((age) => (
                      <Button
                        key={age}
                        type="button"
                        variant={formData.age === age.toString() ? "default" : "outline"}
                        size="lg"
                        onClick={() => updateField('age', age.toString())}
                        className={`h-12 ${formData.age === age.toString() ? 'bg-secondary' : ''}`}
                      >
                        {age}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                // Regular text input for non-kiosk mode
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => updateField('age', e.target.value)}
                  className="w-full border-border"
                  placeholder="Enter your age"
                  required
                />
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="region" className="text-primary">
                Region of Residence <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.region} onValueChange={(value) => updateField('region', value)}>
                <SelectTrigger id="region" className="border-border">
                  <SelectValue placeholder="Please select your region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ncr">National Capital Region (NCR)</SelectItem>
                  <SelectItem value="car">Cordillera Administrative Region (CAR)</SelectItem>
                  <SelectItem value="region1">Region I - Ilocos Region</SelectItem>
                  <SelectItem value="region2">Region II - Cagayan Valley</SelectItem>
                  <SelectItem value="region3">Region III - Central Luzon</SelectItem>
                  <SelectItem value="region4a">Region IV-A - CALABARZON</SelectItem>
                  <SelectItem value="region4b">Region IV-B - MIMAROPA</SelectItem>
                  <SelectItem value="region5">Region V - Bicol Region</SelectItem>
                  <SelectItem value="region6">Region VI - Western Visayas</SelectItem>
                  <SelectItem value="region7">Region VII - Central Visayas</SelectItem>
                  <SelectItem value="region8">Region VIII - Eastern Visayas</SelectItem>
                  <SelectItem value="region9">Region IX - Zamboanga Peninsula</SelectItem>
                  <SelectItem value="region10">Region X - Northern Mindanao</SelectItem>
                  <SelectItem value="region11">Region XI - Davao Region</SelectItem>
                  <SelectItem value="region12">Region XII - SOCCSKSARGEN</SelectItem>
                  <SelectItem value="region13">Region XIII - Caraga</SelectItem>
                  <SelectItem value="barmm">BARMM - Bangsamoro Autonomous Region in Muslim Mindanao</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label htmlFor="service" className="text-primary">
                Service Availed <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.service} onValueChange={(value) => updateField('service', value)}>
                <SelectTrigger id="service" className="border-border">
                  <SelectValue placeholder="Please select the service you availed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business-permit">Business Permit</SelectItem>
                  <SelectItem value="building-permit">Building Permit</SelectItem>
                  <SelectItem value="cedula">Community Tax Certificate (Cedula)</SelectItem>
                  <SelectItem value="civil-registry">Civil Registry Services</SelectItem>
                  <SelectItem value="health-services">Health Services</SelectItem>
                  <SelectItem value="social-services">Social Services</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Show input field when "Other" is selected */}
            {formData.service === 'other' && (
              <div className="space-y-4">
                <Label htmlFor="serviceOther" className="text-primary">
                  Please specify the service <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="serviceOther"
                  type="text"
                  value={formData.serviceOther}
                  onChange={(e) => updateField('serviceOther', e.target.value)}
                  className="w-full border-border"
                  placeholder="Enter the service you availed"
                  required
                />
                <p className="text-xs text-muted-foreground italic">Please provide the name of the service you availed.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Citizens Charter Section */}
        <Card id="cc-section" className="shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-border">
          <CardHeader className="border-b border-border bg-muted/30 pb-5">
            <CardTitle className="text-primary">Citizen&apos;s Charter (CC) Awareness</CardTitle>
            <div className="mt-4 p-5 bg-blue-50/50 rounded-lg border border-blue-200">
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                <strong>The Citizen&apos;s Charter</strong> is an official document that reflects the services of a government agency/office including its requirements, fees, and processing times among others.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-7 pt-6">
            {/* Dynamic CC Questions */}
            {questions.filter(q => q.category === 'CC').map((ccQuestion, index) => (
              <div key={ccQuestion.id} className="space-y-4">
                  <Label className="text-primary">
                    <strong>{ccQuestion.id.toUpperCase()}:</strong> {ccQuestion.text} {ccQuestion.required && <span className="text-destructive">*</span>}
                  </Label>
                  
                  {/* Render based on question type */}
                  {ccQuestion.type === 'Radio' && ccQuestion.choices && (
                    <RadioGroup 
                      value={formData[ccQuestion.id as keyof typeof formData] as string} 
                      onValueChange={(value) => updateField(ccQuestion.id, value)}
                    >
                      {ccQuestion.choices.map((choice, choiceIndex) => {
                        // Extract number from choice for value (e.g., "1" from "1. I know...")
                        const choiceValue = (choiceIndex + 1).toString();
                        return (
                          <Label 
                            key={choiceIndex}
                            htmlFor={`${ccQuestion.id}-${choiceValue}`} 
                            className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                              formData[ccQuestion.id as keyof typeof formData] === choiceValue
                                ? 'bg-secondary/10 border-secondary shadow-md' 
                                : 'bg-muted/50 border-border hover:border-secondary'
                            }`}
                          >
                            <RadioGroupItem value={choiceValue} id={`${ccQuestion.id}-${choiceValue}`} />
                            <span className="flex-1">{choice}</span>
                          </Label>
                        );
                      })}
                    </RadioGroup>
                  )}

                  {ccQuestion.type === 'Text' && (
                    <Textarea
                      value={formData[ccQuestion.id as keyof typeof formData] as string}
                      onChange={(e) => updateField(ccQuestion.id, e.target.value)}
                      onFocus={(e) => handleInputFocus(ccQuestion.id, 'text', e.target)}
                      rows={3}
                      className="w-full border-border"
                      placeholder="Enter your answer..."
                      required={ccQuestion.required}
                      inputMode={kioskMode ? 'none' : 'text'}
                      readOnly={kioskMode}
                    />
                  )}

                  {ccQuestion.type === 'Likert' && (
                    <RadioGroup 
                      value={formData[ccQuestion.id as keyof typeof formData] as string} 
                      onValueChange={(value) => updateField(ccQuestion.id, value)}
                      className={`grid gap-3 ${
                        kioskMode && kioskOrientation === 'portrait' 
                          ? 'grid-cols-2 sm:grid-cols-3' 
                          : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
                      }`}
                    >
                      <Label 
                        htmlFor={`${ccQuestion.id}-1`} 
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-300 ease-out cursor-pointer ${
                          formData[ccQuestion.id as keyof typeof formData] === '1' 
                            ? 'bg-red-100 border-red-500 shadow-lg scale-105' 
                            : 'bg-red-50 border-border hover:border-red-400 hover:shadow-md hover:scale-102'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                          <XCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <RadioGroupItem value="1" id={`${ccQuestion.id}-1`} className="sr-only" />
                        <span className="text-xs text-center leading-tight font-medium">Strongly Disagree</span>
                      </Label>
                      
                      <Label 
                        htmlFor={`${ccQuestion.id}-2`} 
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-300 ease-out cursor-pointer ${
                          formData[ccQuestion.id as keyof typeof formData] === '2' 
                            ? 'bg-orange-100 border-orange-500 shadow-lg scale-105' 
                            : 'bg-orange-50 border-border hover:border-orange-400 hover:shadow-md hover:scale-102'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
                          <Frown className="w-5 h-5 text-orange-600" />
                        </div>
                        <RadioGroupItem value="2" id={`${ccQuestion.id}-2`} className="sr-only" />
                        <span className="text-xs text-center leading-tight font-medium">Disagree</span>
                      </Label>
                      
                      <Label 
                        htmlFor={`${ccQuestion.id}-3`} 
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-300 ease-out cursor-pointer ${
                          formData[ccQuestion.id as keyof typeof formData] === '3' 
                            ? 'bg-yellow-100 border-yellow-500 shadow-lg scale-105' 
                            : 'bg-yellow-50 border-border hover:border-yellow-400 hover:shadow-md hover:scale-102'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Meh className="w-5 h-5 text-yellow-600" />
                        </div>
                        <RadioGroupItem value="3" id={`${ccQuestion.id}-3`} className="sr-only" />
                        <span className="text-xs text-center leading-tight font-medium">Neither</span>
                      </Label>
                      
                      <Label 
                        htmlFor={`${ccQuestion.id}-4`} 
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-300 ease-out cursor-pointer ${
                          formData[ccQuestion.id as keyof typeof formData] === '4' 
                            ? 'bg-lime-100 border-lime-500 shadow-lg scale-105' 
                            : 'bg-lime-50 border-border hover:border-lime-400 hover:shadow-md hover:scale-102'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-lime-100 flex items-center justify-center">
                          <Smile className="w-5 h-5 text-lime-600" />
                        </div>
                        <RadioGroupItem value="4" id={`${ccQuestion.id}-4`} className="sr-only" />
                        <span className="text-xs text-center leading-tight font-medium">Agree</span>
                      </Label>
                      
                      <Label 
                        htmlFor={`${ccQuestion.id}-5`} 
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-300 ease-out cursor-pointer ${
                          formData[ccQuestion.id as keyof typeof formData] === '5' 
                            ? 'bg-green-100 border-green-500 shadow-lg scale-105' 
                            : 'bg-green-50 border-border hover:border-green-400 hover:shadow-md hover:scale-102'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                          <Star className="w-5 h-5 text-green-600 fill-green-600" />
                        </div>
                        <RadioGroupItem value="5" id={`${ccQuestion.id}-5`} className="sr-only" />
                        <span className="text-xs text-center leading-tight font-medium">Strongly Agree</span>
                      </Label>
                      
                      <Label 
                        htmlFor={`${ccQuestion.id}-na`} 
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-300 ease-out cursor-pointer ${
                          formData[ccQuestion.id as keyof typeof formData] === 'na' 
                            ? 'bg-gray-200 border-gray-500 shadow-lg scale-105' 
                            : 'bg-gray-50 border-border hover:border-gray-400 hover:shadow-md hover:scale-102'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                          <MinusCircle className="w-5 h-5 text-gray-600" />
                        </div>
                        <RadioGroupItem value="na" id={`${ccQuestion.id}-na`} className="sr-only" />
                        <span className="text-xs text-center leading-tight font-medium">Not Applicable</span>
                      </Label>
                    </RadioGroup>
                  )}
                </div>
            ))}
          </CardContent>
        </Card>

        {/* Service Quality Dimensions - Instructions */}
        <Card className="shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-border bg-blue-50/50">
          <CardHeader className="pb-5">
            <CardTitle className="text-primary">INSTRUCTIONS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm leading-relaxed">
              For <strong>SQD 0-8</strong>, please <strong>select the option</strong> that best corresponds to your answer for each statement.
            </p>
            
            <div className="bg-white rounded-lg p-6 border-2 border-border shadow-sm">
              <h4 className="text-primary mb-5"><strong>Rating Scale Guide:</strong></h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium text-red-700">Strongly Disagree</div>
                    <div className="text-xs text-red-600">Rating: 1</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Frown className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium text-orange-700">Disagree</div>
                    <div className="text-xs text-orange-600">Rating: 2</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <Meh className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-medium text-yellow-700">Neither Agree nor Disagree</div>
                    <div className="text-xs text-yellow-600">Rating: 3</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-lime-50 rounded-lg border border-lime-200">
                  <div className="w-10 h-10 rounded-full bg-lime-100 flex items-center justify-center flex-shrink-0">
                    <Smile className="w-5 h-5 text-lime-600" />
                  </div>
                  <div>
                    <div className="font-medium text-lime-700">Agree</div>
                    <div className="text-xs text-lime-600">Rating: 4</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-green-600 fill-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-green-700">Strongly Agree</div>
                    <div className="text-xs text-green-600">Rating: 5</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <MinusCircle className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Not Applicable</div>
                    <div className="text-xs text-gray-600">N/A</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Quality Dimensions */}
        <Card id="sqd-section" className="shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-border">
          <CardHeader className="border-b border-border bg-muted/30 pb-5">
            <CardTitle className="text-primary">Service Quality Dimensions (SQD)</CardTitle>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Please rate your agreement with the following statements about our service. All questions marked with <span className="text-destructive">*</span> are required.
            </p>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            {questions.filter(q => q.category === 'SQD').map((sqd) => (
              <div key={sqd.id} className="space-y-5 pb-8 border-b border-border last:border-0 last:pb-0">
                <Label className="text-sm text-primary leading-relaxed">
                  <strong>{sqd.id.toUpperCase()}: {sqd.text}</strong> {sqd.required && <span className="text-destructive">*</span>}
                </Label>
                
                {/* Render based on question type for SQD */}
                {sqd.type === 'Likert' && (
                  <RadioGroup 
                    value={formData[sqd.id as keyof typeof formData]} 
                    onValueChange={(value) => updateField(sqd.id, value)}
                    className={`grid gap-3 ${
                      kioskMode && kioskOrientation === 'portrait' 
                        ? 'grid-cols-2 sm:grid-cols-3' 
                        : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
                    }`}
                  >
                  <Label 
                    htmlFor={`${sqd.id}-1`} 
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      formData[sqd.id as keyof typeof formData] === '1' 
                        ? 'bg-red-100 border-red-500 shadow-lg scale-105' 
                        : 'bg-red-50 border-border hover:border-red-400 hover:shadow-md'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <RadioGroupItem value="1" id={`${sqd.id}-1`} className="sr-only" />
                    <span className="text-xs text-center leading-tight font-medium">Strongly Disagree</span>
                  </Label>
                  
                  <Label 
                    htmlFor={`${sqd.id}-2`} 
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      formData[sqd.id as keyof typeof formData] === '2' 
                        ? 'bg-orange-100 border-orange-500 shadow-lg scale-105' 
                        : 'bg-orange-50 border-border hover:border-orange-400 hover:shadow-md'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
                      <Frown className="w-5 h-5 text-orange-600" />
                    </div>
                    <RadioGroupItem value="2" id={`${sqd.id}-2`} className="sr-only" />
                    <span className="text-xs text-center leading-tight font-medium">Disagree</span>
                  </Label>
                  
                  <Label 
                    htmlFor={`${sqd.id}-3`} 
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      formData[sqd.id as keyof typeof formData] === '3' 
                        ? 'bg-yellow-100 border-yellow-500 shadow-lg scale-105' 
                        : 'bg-yellow-50 border-border hover:border-yellow-400 hover:shadow-md'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Meh className="w-5 h-5 text-yellow-600" />
                    </div>
                    <RadioGroupItem value="3" id={`${sqd.id}-3`} className="sr-only" />
                    <span className="text-xs text-center leading-tight font-medium">Neither</span>
                  </Label>
                  
                  <Label 
                    htmlFor={`${sqd.id}-4`} 
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      formData[sqd.id as keyof typeof formData] === '4' 
                        ? 'bg-lime-100 border-lime-500 shadow-lg scale-105' 
                        : 'bg-lime-50 border-border hover:border-lime-400 hover:shadow-md'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-lime-100 flex items-center justify-center">
                      <Smile className="w-5 h-5 text-lime-600" />
                    </div>
                    <RadioGroupItem value="4" id={`${sqd.id}-4`} className="sr-only" />
                    <span className="text-xs text-center leading-tight font-medium">Agree</span>
                  </Label>
                  
                  <Label 
                    htmlFor={`${sqd.id}-5`} 
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      formData[sqd.id as keyof typeof formData] === '5' 
                        ? 'bg-green-100 border-green-500 shadow-lg scale-105' 
                        : 'bg-green-50 border-border hover:border-green-400 hover:shadow-md'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                      <Star className="w-5 h-5 text-green-600 fill-green-600" />
                    </div>
                    <RadioGroupItem value="5" id={`${sqd.id}-5`} className="sr-only" />
                    <span className="text-xs text-center leading-tight font-medium">Strongly Agree</span>
                  </Label>
                  
                  <Label 
                    htmlFor={`${sqd.id}-na`} 
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      formData[sqd.id as keyof typeof formData] === 'na' 
                        ? 'bg-gray-200 border-gray-500 shadow-lg scale-105' 
                        : 'bg-gray-50 border-border hover:border-gray-400 hover:shadow-md'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                      <MinusCircle className="w-5 h-5 text-gray-600" />
                    </div>
                    <RadioGroupItem value="na" id={`${sqd.id}-na`} className="sr-only" />
                    <span className="text-xs text-center leading-tight font-medium">Not Applicable</span>
                  </Label>
                </RadioGroup>
                )}

                {sqd.type === 'Radio' && sqd.choices && (
                  <RadioGroup 
                    value={formData[sqd.id as keyof typeof formData] as string} 
                    onValueChange={(value) => updateField(sqd.id, value)}
                  >
                    {sqd.choices.map((choice, choiceIndex) => {
                      const choiceValue = (choiceIndex + 1).toString();
                      return (
                        <Label 
                          key={choiceIndex}
                          htmlFor={`${sqd.id}-${choiceValue}`} 
                          className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                            formData[sqd.id as keyof typeof formData] === choiceValue
                              ? 'bg-secondary/10 border-secondary shadow-md' 
                              : 'bg-muted/50 border-border hover:border-secondary'
                          }`}
                        >
                          <RadioGroupItem value={choiceValue} id={`${sqd.id}-${choiceValue}`} className="mt-0.5" />
                          <span className="flex-1">{choice}</span>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                )}

                {sqd.type === 'Text' && (
                  <Textarea
                    value={formData[sqd.id as keyof typeof formData] as string}
                    onChange={(e) => updateField(sqd.id, e.target.value)}
                    rows={3}
                    className="w-full border-border"
                    placeholder="Enter your answer..."
                    required={sqd.required}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Optional Feedback */}
        <Card id="feedback-section" className="shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-border">
          <CardHeader className="border-b border-border bg-muted/30 pb-5">
            <CardTitle className="text-primary">Additional Feedback</CardTitle>
            <p className="text-sm text-muted-foreground mt-3 italic">
              This section is optional but highly appreciated. Help us improve by sharing your suggestions.
            </p>
          </CardHeader>
          <CardContent className="space-y-7 pt-6">
            <div className="space-y-4">
              <Label htmlFor="suggestions" className="text-primary">
                Suggestions on how we can further improve our services:
              </Label>
              <Textarea
                id="suggestions"
                value={formData.suggestions}
                onChange={(e) => updateField('suggestions', e.target.value)}
                onFocus={(e) => handleInputFocus('suggestions', 'text', e.target)}
                placeholder="Please share your suggestions, comments, or feedback here..."
                rows={5}
                className="w-full border-border resize-none"
                inputMode={kioskMode ? 'none' : 'text'}
                readOnly={kioskMode}
              />
              <p className="text-xs text-muted-foreground italic">
                Your insights help us serve you better.
              </p>
            </div>

            <div className="space-y-4">
              <Label htmlFor="email" className="text-primary">
                Email Address:
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                onFocus={(e) => handleInputFocus('email', 'email', e.target)}
                placeholder="your.email@example.com"
                className="w-full border-border"
                inputMode={kioskMode ? 'none' : 'email'}
                readOnly={kioskMode}
              />
              <p className="text-xs text-muted-foreground italic">
                Provide your email address if you would like us to follow up with you regarding your feedback.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="space-y-5 pt-6">
          <Button 
            type="submit" 
            disabled={!isFormComplete}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-16 shadow-[0_6px_24px_rgba(0,123,255,0.3)] hover:shadow-[0_8px_30px_rgba(0,123,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[0_6px_24px_rgba(0,123,255,0.3)]"
            size="lg"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {isFormComplete ? 'SUBMIT FEEDBACK' : `COMPLETE ALL FIELDS (${Math.round(progress)}%)`}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              <span className="text-destructive">*</span> Indicates required fields
            </p>
            <p className="text-xs text-muted-foreground italic">
              Form Reference: <strong>QR-Val-cHR-T 01-F20</strong>
            </p>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="text-center py-10 border-t-2 border-border mt-2">
          <h3 className="text-primary mb-4"><strong>THANK YOU!</strong></h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Your feedback is <em>valuable to us</em> and helps improve our services for everyone. We appreciate you taking the time to complete this survey.
          </p>
        </div>
      </form>
      </div>

      {/* Touch Keyboard for Kiosk Mode */}
      {kioskMode && activeInput && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <TouchKeyboard
            keyboardType={keyboardType}
            onKeyPress={handleKeyboardKeyPress}
            onBackspace={handleKeyboardBackspace}
            onClose={handleKeyboardClose}
          />
        </div>
      )}
    </div>
  );
}