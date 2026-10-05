import React from 'react';
import { Scale, Heart, ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0a0f1d] border-t border-slate-800/80 text-slate-400 text-xs py-10 px-4 mt-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Disclaimer Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>Statutory Legal Disclaimer & Public Information Mandate</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-xs">
            "Legal India" is an access-to-justice technology initiative committed to empowering India's 1.4 billion citizens with verifiable legal information, statutory rights under current laws (Bharatiya Nyaya Sanhita 2023, BNSS 2023, BSA 2023, Consumer Protection Act 2019, RTI Act 2005), and direct paths to remedy. This service provides legal information and self-help document drafts, which do not constitute formal legal representation or an advocate-client relationship. In cases involving severe criminal prosecution or complex civil litigation, citizens are advised to engage an enrolled advocate or approach the District Legal Services Authority (DLSA) for free representation under the Legal Services Authorities Act, 1987.
          </p>
        </div>

        {/* Links & Portals Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-2.5">
              Current Indian Codes
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>Bharatiya Nyaya Sanhita, 2023 (BNS)</li>
              <li>Bharatiya Nagarik Suraksha Sanhita (BNSS)</li>
              <li>Bharatiya Sakshya Adhiniyam, 2023 (BSA)</li>
              <li>Consumer Protection Act, 2019 (CPA)</li>
              <li>Right to Information Act, 2005 (RTI)</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-2.5">
              Emergency Helplines
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><strong className="text-rose-400">112:</strong> National Emergency</li>
              <li><strong className="text-amber-400">1930:</strong> Financial Cyber Fraud</li>
              <li><strong className="text-rose-400">181:</strong> Women in Distress</li>
              <li><strong className="text-emerald-400">15100:</strong> NALSA Free Legal Aid</li>
              <li><strong className="text-amber-400">1915:</strong> National Consumer Line</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-2.5">
              Official Portals
            </h5>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="https://www.indiacode.nic.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center gap-1">
                  <span>India Code (Gazettes)</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a href="https://ecourts.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center gap-1">
                  <span>eCourts Services</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a href="https://edaakhil.nic.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center gap-1">
                  <span>e-Daakhil Consumer</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 flex items-center gap-1">
                  <span>Cyber Crime Portal</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-2.5">
              Privacy by Default
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero personal data storage. No logs with phone numbers or names. Complete privacy for every citizen seeking justice.
            </p>
            <div className="mt-3 flex items-center gap-1 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Free Core for Citizens Forever</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-xs">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-500" />
            <span className="text-slate-300 font-semibold">Legal India</span>
            <span>— A senior lawyer in every pocket, in your own language.</span>
          </div>
          <div>
            Built for 1.4 Billion Citizens • Constitution of India Article 39A
          </div>
        </div>
      </div>
    </footer>
  );
};
