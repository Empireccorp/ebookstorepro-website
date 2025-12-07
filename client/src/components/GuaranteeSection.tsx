interface GuaranteeSectionProps {
  text: string;
}

export default function GuaranteeSection({ text }: GuaranteeSectionProps) {
  if (!text) return null;

  return (
    <section className="py-16 bg-gradient-to-r from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 animate-scale-in">
          <div className="flex items-start gap-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Garantia de Satisfação
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                {text}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
