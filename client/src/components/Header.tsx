import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface HeaderProps {
  onCategoryFilter?: (categorySlug: string | null) => void;
}

export default function Header({ onCategoryFilter }: HeaderProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.status === 'success') {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleCategoryClick = (categorySlug: string | null) => {
    if (onCategoryFilter) {
      onCategoryFilter(categorySlug);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
              Ebook Store Pro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => handleCategoryClick(null)}
              className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300"
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.slug)}
                className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-blue-600 hover:after:w-full after:transition-all after:duration-300"
              >
                {category.name}
              </button>
            ))}
            <Link
              to="/admin/login"
              className="ml-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
            >
              Admin
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <button
              onClick={() => handleCategoryClick(null)}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.slug)}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {category.name}
              </button>
            ))}
            <Link
              to="/admin/login"
              className="block px-4 py-2 mt-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition text-center"
            >
              Admin
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
