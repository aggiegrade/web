'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation'; // To capture query params
import { InstructorTable } from '../../components/InstructorTable/InstructorTable';
import { HeaderSearch } from '../../components/HeaderSearch/HeaderSearch';
import { Footer } from '../../components/Footer/Footer';
import { useEffect, useState } from 'react';

// Force this component to render on the client side
const InstructorPage = () => {
  const searchParams = useSearchParams();
  const [instructorName, setInstructorName] = useState<string | null>(null);

  useEffect(() => {
    const nameParam = searchParams.get('instructor');
    setInstructorName(nameParam);
  }, [searchParams]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HeaderSearch />
      <div style={{ flex: 1 }}>
        {instructorName !== null ? (
          <InstructorTable selectedInstructor={instructorName} />
        ) : (
          <div>Loading...</div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default dynamic(() => Promise.resolve(InstructorPage), { ssr: false }); // Disable SSR
