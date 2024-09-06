'use client'; // Add this to make the component a client component

import { useSearchParams } from 'next/navigation'; // To capture query params
import { SubjectTable } from '../../components/SubjectTable/SubjectTable';
import { HeaderSearch } from '../../components/HeaderSearch/HeaderSearch';
import { Footer } from '../../components/Footer/Footer';

export default function SubjectPage() {
  const searchParams = useSearchParams();  // Get access to the query parameters
  const query = searchParams.get('query'); // Get the value of the 'query' param

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HeaderSearch />
      <div style={{ flex: 1 }}>
        <SubjectTable selectedQuery={query} /> {/* Pass the query to SubjectTable */}
      </div>
      <Footer />
    </div>
  );
}
