import Link from 'next/link';
import type { ReactNode } from 'react';

export type LegalSection = {
  title: string;
  body: ReactNode;
};

type LegalDocumentProps = {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
  alternateHref: string;
  alternateLabel: string;
};

const LegalDocument = ({
  title,
  lastUpdated,
  sections,
  alternateHref,
  alternateLabel,
}: LegalDocumentProps) => {
  return (
    <article className="max-w-full w-full bg-gray-100/20 backdrop-blur-sm p-6 sm:p-10 rounded-2xl shadow-2xl border border-white/20 max-h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-center text-sm text-gray-100 mb-8">  
        Last updated: {lastUpdated}
      </p>

      <div className="space-y-6 text-gray-700 text-sm sm:text-base leading-relaxed">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {section.title}
            </h2>
            <div className="space-y-3 text-gray-300">{section.body}</div>
          </section>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
        <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center sm:justify-start">
          <Link href="/signup" className="text-blue-600 hover:underline font-medium">
            Back to Signup
          </Link>
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Login
          </Link>
          <Link href="/" className="text-blue-600 hover:underline font-medium">
            Home
          </Link>
        </div>
        <Link
          href={alternateHref}
          className="text-center sm:text-right text-gray-300 hover:text-blue-600 hover:underline"
        >
          {alternateLabel}
        </Link>
      </div>
    </article>
  );
};

export default LegalDocument;
