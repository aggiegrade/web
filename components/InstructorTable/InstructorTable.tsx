'use client';
import { Table, Loader, Text, Container, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import '@mantine/charts/styles.css';

interface InstructorTableProps {
  selectedInstructor: string | null;
}

// Define the data structure for each row
interface InstructorSectionData {
  semester: string;
  year: string;
  subject: string;
  course: string;
  section: string;
  departmentName: string;
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

export function InstructorTable({ selectedInstructor }: InstructorTableProps) {
  const searchParams = useSearchParams();
  const instructorName = searchParams.get('instructor');
  const [sectionsData, setSectionsData] = useState<InstructorSectionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (instructorName) {
      const fetchSectionsData = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/instructor-sections?instructorName=${encodeURIComponent(
              instructorName
            )}`
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();

          const processedData: InstructorSectionData[] = data.map((item: any) => ({
            semester: item.Semester,
            year: item.Year,
            subject: item.Subject,
            course: item.Course,
            section: item.Section || 'N/A',
            departmentName: item.DepartmentName || 'Unknown',
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

          setSectionsData(processedData);
        } catch (error) {
          console.error('Failed to fetch section data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchSectionsData();
    }
  }, [instructorName]);

  if (loading) {
    return (
      <div>
        <Loader size="lg" />
        <Text>Loading instructor sections...</Text>
      </div>
    );
  }

  // Map sections data to rows, combining Semester + Year into "Term" and Subject + Course into "Course"
  const rows = sectionsData.map((item, index) => {
    const term = `${item.semester.toUpperCase()} ${item.year}`; // Combine Semester + Year into Term
    const course = `${item.subject} ${item.course}`; // Combine Subject + Course into Course

    return (
      <Table.Tr key={index}>
        <Table.Td>{term}</Table.Td>
        <Table.Td>{course}</Table.Td>
        <Table.Td>{item.section}</Table.Td>
        <Table.Td>{item.departmentName}</Table.Td>
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
    );
  });

  return (
    <Container size="lg" style={{ padding: '0px', marginTop: '-80px' }}>
      <Title order={1} style={{ marginBottom: '5px' }}>
        {instructorName}
      </Title>

      <Table
        striped
        highlightOnHover
        withTableBorder
        verticalSpacing="md"
        withColumnBorders
        stickyHeader
        stickyHeaderOffset={69}
        style={{ maxWidth: '100%', overflowX: 'auto', marginTop: '20px' }}
        className="custom-table"
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Term</Table.Th> {/* Combined Semester + Year */}
            <Table.Th>Course</Table.Th> {/* Combined Subject + Course */}
            <Table.Th>Section</Table.Th>
            <Table.Th>Department</Table.Th>
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
      </Table>
    </Container>
  );
}
