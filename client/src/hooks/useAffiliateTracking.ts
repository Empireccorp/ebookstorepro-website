import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const AFFILIATE_CODE_KEY = 'affiliate_code';
const AFFILIATE_CODE_EXPIRY_KEY = 'affiliate_code_expiry';
const EXPIRY_DAYS = 30; // Código de afiliado válido por 30 dias

export const useAffiliateTracking = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Verificar se há parâmetro 'ref' na URL
    const refCode = searchParams.get('ref');

    if (refCode) {
      // Salvar código de afiliado no localStorage
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + EXPIRY_DAYS);

      localStorage.setItem(AFFILIATE_CODE_KEY, refCode);
      localStorage.setItem(AFFILIATE_CODE_EXPIRY_KEY, expiryDate.toISOString());

      console.log('✅ Affiliate code captured:', refCode);
    }
  }, [searchParams]);
};

export const getAffiliateCode = (): string | null => {
  const code = localStorage.getItem(AFFILIATE_CODE_KEY);
  const expiry = localStorage.getItem(AFFILIATE_CODE_EXPIRY_KEY);

  if (!code || !expiry) {
    return null;
  }

  // Verificar se o código expirou
  const expiryDate = new Date(expiry);
  const now = new Date();

  if (now > expiryDate) {
    // Código expirado, remover
    localStorage.removeItem(AFFILIATE_CODE_KEY);
    localStorage.removeItem(AFFILIATE_CODE_EXPIRY_KEY);
    console.log('⚠️ Affiliate code expired');
    return null;
  }

  return code;
};

export const clearAffiliateCode = () => {
  localStorage.removeItem(AFFILIATE_CODE_KEY);
  localStorage.removeItem(AFFILIATE_CODE_EXPIRY_KEY);
  console.log('🗑️ Affiliate code cleared');
};
