'use client';
import { Table, Loader, Text, Container, Title, Divider } from '@mantine/core';
import { BarChart } from '@mantine/charts';
import { useEffect, useState, useCallback } from 'react';
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
  const [instructorChartData, setInstructorChartData] = useState<any[]>([]);

  const processChartData = useCallback((data: InstructorSectionData[]) => {
    const termCourseMap = new Map<string, Map<string, { totalGPA: number; count: number }>>();

    data.forEach((item) => {
      const term = `${item.semester.toUpperCase()} ${item.year}`;
      const course = `${item.subject} ${item.course}`;
      
      if (!termCourseMap.has(term)) {
        termCourseMap.set(term, new Map());
      }
      const courseMap = termCourseMap.get(term)!;
      
      if (!courseMap.has(course)) {
        courseMap.set(course, { totalGPA: 0, count: 0 });
      }
      const courseData = courseMap.get(course)!;
      
      if (!isNaN(item.averageGPA)) {
        courseData.totalGPA += Number(item.averageGPA); // Convert to number before adding
        courseData.count++;
      }

    });

    console.log('Processed chart data:', Array.from(termCourseMap.entries()));

    return Array.from(termCourseMap.entries()).map(([term, courseMap]) => {
      const chartItem: any = { term };
      courseMap.forEach((data, course) => {
        if (data.count > 0) {
          chartItem[course] = Number((data.totalGPA / data.count).toFixed(2));
        }
      });
      return chartItem;
    });
  }, []);

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

          // Process data for the chart
          const chartData = processChartData(processedData);
          setInstructorChartData(chartData);
          console.log('Instructor Chart Data:', chartData);
        } catch (error) {
          console.error('Failed to fetch section data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchSectionsData();
    }
  }, [instructorName, processChartData]);

  if (loading) {
    return (
      <div>
        <Loader size="lg" />
        <Text>Loading instructor sections...</Text>
      </div>
    );
  }

  const getAllCourses = (data: any[]) => {
    const courses = new Set<string>();
    data.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'term') courses.add(key);
      });
    });
    return Array.from(courses);
  };

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
    <Container size="lg" style={{ padding: '0px', marginTop: '0px' }}>
      <Title order={1} style={{ marginBottom: '5px' }}>
        {instructorName}
      </Title>

      <Divider my="md" size={8} label="Data" />
      <div>
        <Title order={4} style={{ marginBottom: '20px' }}>Average GPA over time by Course</Title>
        <BarChart
          h={300}
          data={instructorChartData}
          dataKey="term"
          series={
            getAllCourses(instructorChartData).map((course, index) => ({
              name: course,
              color: `var(--mantine-color-${['indigo', 'blue', 'teal', 'cyan', 'green', 'yellow', 'orange', 'red'][index % 8]}-6)`,
            }))
          }
          tickLine="y"
          yAxisProps={{ domain: [0, 4] }}
          withLegend
          orientation="horizontal"
          tooltipAnimationDuration={200}
          legendProps={{ verticalAlign: 'bottom', height: 10 }}
          xAxisLabel="Term"
          yAxisLabel="GPA"
        />
      </div>

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
