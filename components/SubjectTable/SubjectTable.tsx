'use client';
import { Table, Container, Loader, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Use this to capture the query parameters
import classes from './SubjectTable.module.css';

interface SubjectTableProps {
  selectedQuery: string | null; // The selected query might be null initially
}

// Define the data structure for each row
interface CourseData {
  term: string;
  section: string;
  instructor: string;
  enrolled: number;
  gpa: number;
  a: number;
  b: number;
  c: number;
  d: number;
  f: number;
  dw: number;
  u: number;
  s: number;
}

export function SubjectTable({ selectedQuery }: SubjectTableProps) {
  const searchParams = useSearchParams(); // Use useSearchParams to get the query params
  const query = searchParams.get('query'); // Get the query param from the URL (e.g., "ACCT 327")
  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      // Run the API request only if the query parameter exists
      const fetchCourseData = async () => {
        try {
          <div>
            <h1>Subject Data</h1>
            {selectedQuery ? (
              <p>Displaying results for: {selectedQuery}</p>
            ) : (
              <p>No subject selected</p>
            )}
          </div>;
          // Make a dynamic API call, passing the query parameter as a filter
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/detailed-sections?search=${encodeURIComponent(query)}`
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();

          // Process the data to combine SubjectCode and Course into Term
          const processedData: CourseData[] = data.map((item: any) => ({
            term: `${item.Subject} ${item.Course} (${item.Semester} ${item.Year})`, // Example combination
            section: item.Section || 'N/A',
            instructor: item.InstructorName || 'Unknown',
            enrolled: item.TotalStudents || 0,
            gpa: item.Average_GPA || 0,
            a: item.A || 0,
            b: item.B || 0,
            c: item.C || 0,
            d: item.D || 0,
            f: item.F || 0,
            dw: item.DroppedWithdrawn || 0,
            u: item.Unsatisfactory || 0,
            s: item.Satisfactory || 0,
          }));

          setCourseData(processedData);
        } catch (error) {
          console.error('Failed to fetch course data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchCourseData();
    }
  }, [query]);

  if (loading) {
    return (
      <Container size="md" className={classes.loaderContainer}>
        <Loader size="lg" />
        <Text className={classes.loadingText}>Loading course data...</Text>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl" className={classes.container}>
      <Text size="lg" mb="lg">
        Results for: {query}
      </Text>{' '}
      {/* Display search term */}
      <Table highlightOnHover>
        <thead>
          <tr>
            <th>Term</th>
            <th>Section</th>
            <th>Instructor</th>
            <th># Enrolled</th>
            <th>GPA</th>
            <th>A</th>
            <th>B</th>
            <th>C</th>
            <th>D</th>
            <th>F</th>
            <th>D/W</th>
            <th>U</th>
            <th>S</th>
          </tr>
        </thead>
        <tbody>
          {courseData.map((item, index) => (
            <tr key={index}>
              <td>{item.term}</td>
              <td>{item.section}</td>
              <td>{item.instructor}</td>
              <td>{item.enrolled}</td>
              <td>{typeof item.gpa === 'number' ? item.gpa.toFixed(2) : 'N/A'}</td>
              <td>{item.a}</td>
              <td>{item.b}</td>
              <td>{item.c}</td>
              <td>{item.d}</td>
              <td>{item.f}</td>
              <td>{item.dw}</td>
              <td>{item.u}</td>
              <td>{item.s}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
