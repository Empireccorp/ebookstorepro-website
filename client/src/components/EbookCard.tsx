import { Link } from 'react-router-dom';
import { EbookListItem } from '../types/ebook';

interface EbookCardProps {
  ebook: EbookListItem;
}

export default function EbookCard({ ebook }: EbookCardProps) {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  return (
    <Link 
      to={`/ebook/${ebook.slug}`}
      className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
        {ebook.coverUrl ? (
          <img
            src={ebook.coverUrl}
            alt={ebook.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">E</span>
              </div>
              <p className="text-gray-600 font-semibold">{ebook.title}</p>
            </div>
          </div>
        )}
        
        <div className="absolute top-2 right-2">
          <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {ebook.category}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {ebook.title}
        </h3>
        
        {ebook.subtitle && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
            {ebook.subtitle}
          </p>
        )}
        
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
          {ebook.shortDescription}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">
            {formatPrice(Number(ebook.priceDisplay), ebook.currency)}
          </span>
          
          <span className="text-sm text-blue-600 font-semibold group-hover:underline">
            Ver detalhes →
          </span>
        </div>
      </div>
    </Link>
  );
}
