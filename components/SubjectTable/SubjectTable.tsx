'use client';
import { Table, Loader, Text, Container } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface SubjectTableProps {
  selectedQuery: string | null;
}

// Define the data structure for each row
interface CourseData {
  semester: string;
  year: string;
  section: string;
  instructorName: string;
  totalStudents: number;
  a: number;
  b: number;
  c: number;
  d: number;
  f: number;
  droppedWithdrawn: number;
  incomplete: number;
  satisfactory: number;
  unsatisfactory: number;
  noGrade: number;
  averageGPA: number;
}

export function SubjectTable({ selectedQuery }: SubjectTableProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get('query');
  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      const fetchCourseData = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/detailed-sections?search=${encodeURIComponent(
              query
            )}`
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();

          const processedData: CourseData[] = data.map((item: any) => ({
            semester: item.Semester,
            year: item.Year,
            section: item.Section || 'N/A',
            instructorName: item.InstructorName || 'Unknown',
            totalStudents: item.TotalStudents || 0,
            a: item.A || 0,
            b: item.B || 0,
            c: item.C || 0,
            d: item.D || 0,
            f: item.F || 0,
            droppedWithdrawn: item.DroppedWithdrawn || 0,
            incomplete: item.Incomplete || 0,
            satisfactory: item.Satisfactory || 0,
            unsatisfactory: item.Unsatisfactory || 0,
            noGrade: item.NoGrade || 0,
            averageGPA: item.Average_GPA || 0,
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
      <div>
        <Loader size="lg" />
        <Text>Loading course data...</Text>
      </div>
    );
  }

  // Map course data to rows
  const rows = courseData.map((item, index) => (
    <Table.Tr key={index}>
      <Table.Td>{item.semester}</Table.Td>
      <Table.Td>{item.year}</Table.Td>
      <Table.Td>{item.section}</Table.Td>
      <Table.Td>{item.instructorName}</Table.Td>
      <Table.Td>{item.totalStudents}</Table.Td>
      <Table.Td>{item.a}</Table.Td>
      <Table.Td>{item.b}</Table.Td>
      <Table.Td>{item.c}</Table.Td>
      <Table.Td>{item.d}</Table.Td>
      <Table.Td>{item.f}</Table.Td>
      <Table.Td>{item.droppedWithdrawn}</Table.Td>
      <Table.Td>{item.incomplete}</Table.Td>
      <Table.Td>{item.satisfactory}</Table.Td>
      <Table.Td>{item.unsatisfactory}</Table.Td>
      <Table.Td>{item.noGrade}</Table.Td>
      <Table.Td>{item.averageGPA}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="lg" style={{ padding: '20px' }}>
      <Table
        striped
        highlightOnHover
        withTableBorder
        verticalSpacing="md"
        withColumnBorders
        stickyHeader
        stickyHeaderOffset={69}
        style={{ maxWidth: '100%', overflowX: 'auto' }}
        className="custom-table"
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Semester</Table.Th>
            <Table.Th>Year</Table.Th>
            <Table.Th>Section</Table.Th>
            <Table.Th>Instructor</Table.Th>
            <Table.Th># Enrolled</Table.Th>
            <Table.Th>A</Table.Th>
            <Table.Th>B</Table.Th>
            <Table.Th>C</Table.Th>
            <Table.Th>D</Table.Th>
            <Table.Th>F</Table.Th>
            <Table.Th>Q</Table.Th>
            <Table.Th>I</Table.Th>
            <Table.Th>S</Table.Th>
            <Table.Th>U</Table.Th>
            <Table.Th>X</Table.Th>
            <Table.Th>Average GPA</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
        {/* <Table.Caption>Course performance data</Table.Caption> */}
      </Table>
    </Container>
  );
}
