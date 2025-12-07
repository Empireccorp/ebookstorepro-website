interface AuthorSectionProps {
  name: string;
  bio: string;
  photoUrl?: string;
}

export default function AuthorSection({ name, bio, photoUrl }: AuthorSectionProps) {
  if (!name || !bio) return null;

  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 animate-fade-in-up">
          Sobre o Autor
        </h2>
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 animate-scale-in">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Photo */}
            <div className="flex-shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{name}</h3>
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                {bio}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
