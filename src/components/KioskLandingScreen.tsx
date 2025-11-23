import { motion } from 'framer-motion';
import { Award, ClipboardCheck, HandHelping, MonitorSmartphone, Hand, Sparkles, CheckCircle2 } from 'lucide-react';
import valenzuelaLogo from 'figma:asset/3da91e378b5746d28e242948a192281543f29d21.png';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface KioskLandingScreenProps {
  onStartSurvey: () => void;
}

export function KioskLandingScreen({ onStartSurvey }: KioskLandingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D3B66] via-[#1a5080] to-[#0D3B66] flex items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-5xl w-full bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden"
      >
        {/* Header with Logo */}
        <div className="bg-gradient-to-r from-[#0D3B66] to-[#3FA7D6] text-white py-12 px-8 text-center relative overflow-hidden">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative z-10"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <ImageWithFallback
                  src={valenzuelaLogo}
                  alt="City Government of Valenzuela Logo"
                  className="h-24 w-auto"
                />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              Welcome to Valenzuela CSS
            </h1>
            <p className="text-xl md:text-2xl text-blue-100">
              Customer Satisfaction Survey
            </p>
          </motion.div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
        </div>

        {/* Main Content */}
        <div className="p-12">
          {/* Introduction */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-50 text-[#0D3B66] rounded-full">
              <Award className="w-5 h-5" />
              <span className="text-sm font-semibold">ARTA-Compliant Survey System</span>
            </div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Your feedback helps us improve our services and better serve the citizens of Valenzuela. 
              This survey is part of our commitment to transparency and excellent public service delivery.
            </p>
          </motion.div>

          {/* Instructions Grid */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-[#0D3B66] mb-6 text-center flex items-center justify-center gap-2">
              <ClipboardCheck className="w-7 h-7" />
              How to Participate
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border-2 border-blue-100 hover:border-[#3FA7D6] transition-all duration-300">
                <div className="w-14 h-14 bg-[#3FA7D6] rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="font-bold text-[#0D3B66] mb-2 text-center">Provide Your Information</h3>
                <p className="text-sm text-gray-600 text-center">
                  Fill in your basic details to help us understand who we're serving
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border-2 border-blue-100 hover:border-[#3FA7D6] transition-all duration-300">
                <div className="w-14 h-14 bg-[#3FA7D6] rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="font-bold text-[#0D3B66] mb-2 text-center">Rate Our Services</h3>
                <p className="text-sm text-gray-600 text-center">
                  Answer questions using a 5-point scale based on your experience
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border-2 border-blue-100 hover:border-[#3FA7D6] transition-all duration-300">
                <div className="w-14 h-14 bg-[#3FA7D6] rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="font-bold text-[#0D3B66] mb-2 text-center">Submit Feedback</h3>
                <p className="text-sm text-gray-600 text-center">
                  Complete the survey and receive your reference number
                </p>
              </div>
            </div>
          </motion.div>

          {/* Key Features */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border-2 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-[#0D3B66]">Why Your Feedback Matters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Improve Services</p>
                    <p className="text-sm text-gray-600">Your input directly influences service quality improvements</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">ARTA Compliance</p>
                    <p className="text-sm text-gray-600">Ensures government accountability and transparency</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Quick & Easy</p>
                    <p className="text-sm text-gray-600">Takes only 5-7 minutes to complete</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-800">Anonymous Option</p>
                    <p className="text-sm text-gray-600">Email address is optional for privacy</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Touch to Start Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-center"
          >
            <motion.button
              onClick={onStartSurvey}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-flex items-center gap-4 px-16 py-8 bg-gradient-to-r from-[#0D3B66] to-[#3FA7D6] text-white rounded-2xl shadow-[0_10px_40px_rgba(13,59,102,0.4)] hover:shadow-[0_15px_50px_rgba(13,59,102,0.5)] transition-all duration-300 overflow-hidden"
            >
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#3FA7D6] to-[#0D3B66] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              ></motion.div>
              
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative z-10"
              >
                <Hand className="w-12 h-12" />
              </motion.div>
              
              <div className="relative z-10 text-left">
                <p className="text-3xl font-bold mb-1">Tap to Start Survey</p>
                <p className="text-sm text-blue-100">Touch anywhere on this button to begin</p>
              </div>
            </motion.button>

            <motion.div
              animate={{ 
                y: [0, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mt-8 flex items-center justify-center gap-2 text-gray-500"
            >
              <MonitorSmartphone className="w-5 h-5" />
              <p className="text-sm">Optimized for touch screen interaction</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 py-6 px-8 text-center border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <HandHelping className="w-4 h-4 inline mr-2" />
            Need assistance? Please call our staff for help
          </p>
          <p className="text-xs text-gray-500 mt-2">
            All responses are confidential and used solely for service improvement
          </p>
        </div>
      </motion.div>
    </div>
  );
}
