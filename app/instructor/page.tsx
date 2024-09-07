'use client'; // Add this to make the component a client component

import { useSearchParams } from 'next/navigation'; // To capture query params
import { InstructorTable } from '../../components/InstructorTable/InstructorTable'; // Ensure this imports InstructorTable correctly
import { HeaderSearch } from '../../components/HeaderSearch/HeaderSearch';
import { Footer } from '../../components/Footer/Footer';

export default function InstructorPage() {
  const searchParams = useSearchParams();  // Get access to the query parameters
  const instructorName = searchParams.get('instructor'); // Get the value of the 'instructor' param

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HeaderSearch />
      <div style={{ flex: 1 }}>
        <InstructorTable selectedInstructor={instructorName} /> {/* Pass the instructorName to InstructorTable */}
      </div>
      <Footer />
    </div>
  );
}
