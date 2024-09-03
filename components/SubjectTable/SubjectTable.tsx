'use client';
import { useRouter } from 'next/router';
import { Table, Container, Loader, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import classes from './SubjectTable.module.css';

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

export function SubjectTable() {
  const router = useRouter();
  const { query } = router.query; // Get the value passed from the previous page
  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch course data when the component first mounts
  useEffect(() => {
    
    const fetchCourseData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/subject-and-courses`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Process the data to combine SubjectCode and Course into Term
        const processedData: CourseData[] = data.map((item: any) => ({
          term: `${item.SubjectCode.toUpperCase()} ${item.Course}`,
          section: item.section,
          instructor: item.instructor,
          enrolled: item.enrolled,
          gpa: item.gpa,
          a: item.a,
          b: item.b,
          c: item.c,
          d: item.d,
          f: item.f,
          dw: item.dw,
          u: item.u,
          s: item.s,
        }));

        setCourseData(processedData);
      } catch (error) {
        console.error('Failed to fetch course data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, []);

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
      {query && (
        <Text className={classes.selectedQuery} size="lg" mb="lg">
          Selected Search: {query}
        </Text>
      )}
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
              <td>{item.gpa ? item.gpa.toFixed(2) : 'N/A'}</td> {/* Updated Line */}
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
