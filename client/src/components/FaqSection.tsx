import { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  items: FaqItem[];
}

export default function FaqSection({ items }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 animate-fade-in-up">
          Perguntas Frequentes
        </h2>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {item.question}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 whitespace-pre-line">{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
