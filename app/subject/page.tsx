'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation'; // To capture query params
import { SubjectTable } from '../../components/SubjectTable/SubjectTable';
import { HeaderSearch } from '../../components/HeaderSearch/HeaderSearch';
import { Footer } from '../../components/Footer/Footer';
import { useEffect, useState } from 'react';

// Force this component to render on the client side
const SubjectPage = () => {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState<string | null>(null);

  useEffect(() => {
    const queryParam = searchParams.get('query');
    setQuery(queryParam);
  }, [searchParams]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HeaderSearch />
      <div style={{ flex: 1 }}>
        {query !== null ? (
          <SubjectTable selectedQuery={query} /> // Pass the query to SubjectTable
        ) : (
          <div>Loading...</div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default dynamic(() => Promise.resolve(SubjectPage), { ssr: false }); // Disable SSR
