import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface TermsOfUseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsOfUseDialog({ open, onOpenChange }: TermsOfUseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#0D3B66]">
            <FileText className="w-5 h-5" />
            Terms of Use
          </DialogTitle>
          <DialogDescription>
            City Government of Valenzuela ARTA CSS System — Effective Date: January 2025
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            {/* Introduction */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold">1. Acceptance of Terms</h3>
              <p className="text-[#0B172A]/70 leading-relaxed">
                Welcome to the City Government of Valenzuela's ARTA-Compliant Customer Satisfaction Survey (CSS) System. By accessing or using this platform, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use this system. These terms apply to all users, including citizens, businesses, government entities, and administrative personnel.
              </p>
            </section>

            {/* Purpose */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold">2. Purpose of the System</h3>
              <div className="space-y-3 text-[#0B172A]/70 leading-relaxed">
                <p>This system is designed to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Collect citizen feedback on government services in compliance with the Anti-Red Tape Authority (ARTA) regulations</li>
                  <li>Measure customer satisfaction levels for public service delivery</li>
                  <li>Identify areas for improvement in government operations</li>
                  <li>Promote transparency and accountability in local governance</li>
                  <li>Facilitate data-driven decision-making for service enhancement</li>
                </ul>
              </div>
            </section>

            {/* Eligibility */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold">3. Eligibility</h3>
              <div className="space-y-3 text-[#0B172A]/70 leading-relaxed">
                <p>To use this system, you must:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
                  <li>Have recently availed of a service from the City Government of Valenzuela</li>
                  <li>Provide accurate and truthful information in your survey responses</li>
                  <li>Have the legal capacity to enter into this agreement</li>
                </ul>
              </div>
            </section>

            {/* User Responsibilities */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                4. User Responsibilities
              </h3>
              <div className="space-y-3 text-[#0B172A]/70 leading-relaxed">
                <p>As a user of this system, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Provide Accurate Information:</strong> Ensure all information submitted is true, accurate, and complete</li>
                  <li><strong>Submit Feedback in Good Faith:</strong> Provide honest and constructive feedback based on your actual experience</li>
                  <li><strong>Respect the System:</strong> Do not misuse, attempt to hack, or disrupt the operation of this platform</li>
                  <li><strong>Maintain Confidentiality:</strong> If provided with a Reference ID, keep it secure and do not share it with unauthorized parties</li>
                  <li><strong>Comply with Laws:</strong> Use the system in compliance with all applicable local, national, and international laws</li>
                  <li><strong>Submit Once Per Transaction:</strong> Only submit one survey per service transaction to ensure data integrity</li>
                </ul>
              </div>
            </section>

            {/* Prohibited Activities */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                5. Prohibited Activities
              </h3>
              <div className="space-y-3 text-[#0B172A]/70 leading-relaxed">
                <p>The following activities are strictly prohibited:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Submitting false, misleading, or fraudulent information</li>
                  <li>Using automated systems, bots, or scripts to submit multiple surveys</li>
                  <li>Attempting to manipulate, alter, or tamper with survey results</li>
                  <li>Reverse engineering, decompiling, or disassembling the system</li>
                  <li>Introducing malware, viruses, or harmful code</li>
                  <li>Impersonating another person or entity</li>
                  <li>Harassing, defaming, or threatening government personnel through survey comments</li>
                  <li>Using the system for commercial solicitation or advertising</li>
                  <li>Attempting to gain unauthorized access to administrative functions</li>
                </ul>
                <p className="mt-3 bg-red-50 p-4 rounded-lg border border-red-200">
                  <strong>Note:</strong> Violation of these terms may result in the rejection of your survey, legal action, and/or reporting to appropriate authorities.
                </p>
              </div>
            </section>

            {/* Data Collection and Privacy */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold">6. Data Collection and Privacy</h3>
              <p className="text-[#0B172A]/70 leading-relaxed">
                By using this system, you acknowledge and agree to the collection, processing, and use of your personal information as described in our <strong>Privacy Policy</strong>. All data is handled in strict compliance with the Data Privacy Act of 2012 (Republic Act No. 10173). We are committed to protecting your privacy and maintaining the confidentiality of your information.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold">7. Intellectual Property Rights</h3>
              <p className="text-[#0B172A]/70 leading-relaxed">
                All content, design, graphics, logos, and software associated with this system are the property of the City Government of Valenzuela or its licensors and are protected by Philippine and international copyright, trademark, and intellectual property laws. You may not copy, reproduce, distribute, modify, or create derivative works without express written permission from the City Government of Valenzuela.
              </p>
            </section>

            {/* System Availability */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold">8. System Availability and Modifications</h3>
              <div className="space-y-3 text-[#0B172A]/70 leading-relaxed">
                <p>The City Government of Valenzuela reserves the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Modify, suspend, or discontinue any aspect of the system at any time without prior notice</li>
                  <li>Update survey questions or system features to comply with new regulations</li>
                  <li>Perform routine maintenance that may temporarily affect system availability</li>
                  <li>Change these Terms of Use at any time, with changes effective upon posting</li>
                </ul>
                <p className="mt-3">
                  While we strive for 24/7 availability, we do not guarantee uninterrupted access and are not liable for any downtime or technical issues.
                </p>
              </div>
            </section>

            {/* Disclaimer of Warranties */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold">9. Disclaimer of Warranties</h3>
              <div className="space-y-3 text-[#0B172A]/70 leading-relaxed">
                <p>This system is provided on an "as is" and "as available" basis. The City Government of Valenzuela makes no warranties, express or implied, including but not limited to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Warranties of merchantability or fitness for a particular purpose</li>
                  <li>Warranties that the system will be error-free or uninterrupted</li>
                  <li>Warranties regarding the accuracy, reliability, or completeness of information</li>
                  <li>Warranties that defects will be corrected</li>
                </ul>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold">10. Limitation of Liability</h3>
              <p className="text-[#0B172A]/70 leading-relaxed">
                To the fullest extent permitted by law, the City Government of Valenzuela, its officials, employees, and agents shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of or inability to use this system, including but not limited to data loss, service interruption, or unauthorized access to your information. Your sole remedy for dissatisfaction with the system is to stop using it.
              </p>
            </section>

            {/* Indemnification */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold">11. Indemnification</h3>
              <p className="text-[#0B172A]/70 leading-relaxed">
                You agree to indemnify, defend, and hold harmless the City Government of Valenzuela and its officials, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your violation of these Terms of Use, your misuse of the system, or your violation of any laws or rights of third parties.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold">12. Governing Law and Dispute Resolution</h3>
              <p className="text-[#0B172A]/70 leading-relaxed">
                These Terms of Use shall be governed by and construed in accordance with the laws of the Republic of the Philippines. Any disputes arising from or relating to these terms or your use of the system shall be subject to the exclusive jurisdiction of the courts of Valenzuela City, Metro Manila, Philippines.
              </p>
            </section>

            {/* Severability */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold">13. Severability</h3>
              <p className="text-[#0B172A]/70 leading-relaxed">
                If any provision of these Terms of Use is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be replaced with a valid provision that most closely reflects the original intent.
              </p>
            </section>

            {/* Entire Agreement */}
            <section>
              <h3 className="text-[#0D3B66] mb-3 !font-bold">14. Entire Agreement</h3>
              <p className="text-[#0B172A]/70 leading-relaxed">
                These Terms of Use, together with the Privacy Policy, constitute the entire agreement between you and the City Government of Valenzuela regarding your use of this system and supersede all prior agreements, understandings, and communications, whether written or oral.
              </p>
            </section>

            {/* Contact Information */}
            <section className="bg-[#F5F9FC] p-6 rounded-lg border border-[#e5e9f0]">
              <h3 className="text-[#0D3B66] mb-3 !font-bold">15. Contact Information</h3>
              <div className="space-y-2 text-[#0B172A]/70 leading-relaxed">
                <p>
                  For questions, concerns, or feedback regarding these Terms of Use, please contact:
                </p>
                <p>
                  <strong>Information and Communications Technology Office (ICTO)</strong><br />
                  City Government of Valenzuela<br />
                  Valenzuela City Hall, MacArthur Highway, Malinta, Valenzuela City
                </p>
                <p>
                  <strong>Email:</strong> <a href="mailto:icto@valenzuela.gov.ph" className="text-[#3FA7D6] hover:underline">icto@valenzuela.gov.ph</a><br />
                  <strong>Phone:</strong> (02) 8292-1405 local 1234
                </p>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="bg-[#3FA7D6]/10 p-6 rounded-lg border border-[#3FA7D6]/30">
              <h3 className="text-[#0D3B66] mb-3 !font-bold">16. Acknowledgment</h3>
              <p className="text-[#0B172A]/70 leading-relaxed">
                By clicking "Submit" on the survey form or accessing this system, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use and the Privacy Policy. If you do not agree, you must not use this system.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
