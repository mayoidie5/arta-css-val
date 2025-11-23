import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

interface PrivacyPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyPolicyDialog({ open, onOpenChange }: PrivacyPolicyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#0D3B66]">
            <Shield className="w-5 h-5" />
            Privacy Policy
          </DialogTitle>
          <DialogDescription>
            City Government of Valenzuela ARTA CSS System — Last Updated: January 2025
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            {/* Introduction */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold">1. Introduction</h3>
              <p className="text-[#0B172A]/70 leading-relaxed">
                The City Government of Valenzuela is committed to protecting the privacy and security of all personal information collected through the ARTA-Compliant Customer Satisfaction Survey (CSS) System. This Privacy Policy explains how we collect, use, store, and protect your information in compliance with the Data Privacy Act of 2012 (Republic Act No. 10173) and its implementing rules and regulations.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                2. Information We Collect
              </h3>
              <div className="space-y-3 text-[#0B172A]/70 leading-relaxed">
                <p>We collect the following types of information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Basic Contact Information:</strong> Name, email address, and age range</li>
                  <li><strong>Service Information:</strong> Type of service availed, client type (Citizen, Business, Government), and region of residence</li>
                  <li><strong>Feedback Data:</strong> Responses to ARTA-compliant Customer Satisfaction Survey questions (CC1-CC3 and SQD0-SQD8)</li>
                  <li><strong>Technical Data:</strong> Device type, browser information, IP address, and submission timestamp</li>
                  <li><strong>Optional Information:</strong> Additional comments, suggestions, or requests provided voluntarily</li>
                </ul>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold flex items-center gap-2">
                <Eye className="w-4 h-4" />
                3. How We Use Your Information
              </h3>
              <div className="space-y-3 text-[#0B172A]/70 leading-relaxed">
                <p>Your information is used exclusively for the following legitimate purposes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Measuring and improving the quality of government services</li>
                  <li>Complying with the Anti-Red Tape Authority (ARTA) reporting requirements</li>
                  <li>Identifying service delivery bottlenecks and areas for improvement</li>
                  <li>Generating aggregated statistical reports for policy-making</li>
                  <li>Responding to your specific concerns or requests when provided</li>
                  <li>Ensuring accountability and transparency in government operations</li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold flex items-center gap-2">
                <Lock className="w-4 h-4" />
                4. Data Security and Protection
              </h3>
              <div className="space-y-3 text-[#0B172A]/70 leading-relaxed">
                <p>We implement comprehensive security measures to protect your information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Encryption:</strong> All data is encrypted during transmission and storage</li>
                  <li><strong>Access Controls:</strong> Only authorized personnel have access to survey responses</li>
                  <li><strong>Secure Infrastructure:</strong> Data is stored on secure government servers with regular backups</li>
                  <li><strong>Audit Trails:</strong> All access to personal data is logged and monitored</li>
                  <li><strong>Regular Reviews:</strong> Security protocols are reviewed and updated regularly</li>
                </ul>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold">5. Data Retention</h3>
              <p className="text-[#0B172A]/70 leading-relaxed">
                Survey responses are retained for a period of two (2) years from the date of submission, or as required by ARTA regulations and government record-keeping policies. After this period, data may be archived or anonymized for historical and statistical purposes. You may request deletion of your data before the retention period by contacting our Data Protection Officer.
              </p>
            </section>

            {/* Sharing of Information */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold">6. Sharing of Information</h3>
              <div className="space-y-3 text-[#0B172A]/70 leading-relaxed">
                <p>We do not sell, trade, or share your personal information with third parties except:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>When required by law or court order</li>
                  <li>With the Anti-Red Tape Authority (ARTA) for compliance reporting (anonymized/aggregated data only)</li>
                  <li>With other government agencies for service improvement purposes, with proper data sharing agreements</li>
                  <li>With your explicit written consent</li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold">7. Your Data Privacy Rights</h3>
              <div className="space-y-3 text-[#0B172A]/70 leading-relaxed">
                <p>Under the Data Privacy Act of 2012, you have the following rights:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Right to be Informed:</strong> You have the right to know how your data is being processed</li>
                  <li><strong>Right to Access:</strong> You may request access to your submitted survey responses</li>
                  <li><strong>Right to Rectification:</strong> You may request correction of inaccurate information</li>
                  <li><strong>Right to Erasure:</strong> You may request deletion of your data under certain circumstances</li>
                  <li><strong>Right to Data Portability:</strong> You may request a copy of your data in a commonly used format</li>
                  <li><strong>Right to Object:</strong> You may object to certain types of data processing</li>
                </ul>
                <p className="mt-3">
                  To exercise any of these rights, please contact our Data Protection Officer using the contact information below.
                </p>
              </div>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold">8. Cookies and Tracking Technologies</h3>
              <p className="text-[#0B172A]/70 leading-relaxed">
                This system uses minimal cookies and local storage to ensure proper functionality and to prevent duplicate submissions. These technologies do not track your browsing behavior outside of this application. Session data is stored locally on your device and is automatically cleared when you close your browser.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold">9. Children's Privacy</h3>
              <p className="text-[#0B172A]/70 leading-relaxed">
                This survey system is intended for individuals 18 years of age or older. We do not knowingly collect personal information from minors. If we become aware that a minor has submitted a survey, we will take steps to delete such information. If you are a parent or guardian and believe your child has submitted a survey, please contact us immediately.
              </p>
            </section>

            {/* Changes to This Policy */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold">10. Changes to This Privacy Policy</h3>
              <p className="text-[#0B172A]/70 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify users of any material changes by posting the updated policy on this platform with a revised "Last Updated" date. Your continued use of the system after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-[#F5F9FC] p-6 rounded-lg border border-[#e5e9f0]">
              <h3 className="text-[#0D3B66] mb-3 !font-bold">11. Contact Information</h3>
              <div className="space-y-2 text-[#0B172A]/70 leading-relaxed">
                <p>
                  <strong>Data Protection Officer</strong><br />
                  Information and Communications Technology Office (ICTO)<br />
                  City Government of Valenzuela<br />
                  Valenzuela City Hall, MacArthur Highway, Malinta, Valenzuela City
                </p>
                <p>
                  <strong>Email:</strong> <a href="mailto:dpo@valenzuela.gov.ph" className="text-[#3FA7D6] hover:underline">dpo@valenzuela.gov.ph</a><br />
                  <strong>Phone:</strong> (02) 8292-1405 local 1234
                </p>
                <p className="mt-4 text-xs">
                  For complaints or concerns regarding data privacy, you may also file a complaint with the National Privacy Commission at <a href="https://privacy.gov.ph" className="text-[#3FA7D6] hover:underline" target="_blank" rel="noopener noreferrer">privacy.gov.ph</a>
                </p>
              </div>
            </section>

            {/* Consent */}
            <section className="bg-[#3FA7D6]/10 p-6 rounded-lg border border-[#3FA7D6]/30">
              <h3 className="text-[#0D3B66] mb-3 !font-bold">12. Consent</h3>
              <p className="text-[#0B172A]/70 leading-relaxed">
                By submitting the Customer Satisfaction Survey, you acknowledge that you have read, understood, and agree to this Privacy Policy. You consent to the collection, use, and processing of your personal information as described herein.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
