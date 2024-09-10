'use client';
import { Table, Loader, Text, Container, Title, Tooltip, Button, Badge, Divider } from '@mantine/core';
import { AreaChart, LineChart, BarChart } from '@mantine/charts';
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import '@mantine/charts/styles.css';

interface SubjectTableProps {
  selectedQuery: string | null;
}

// Define the data structure for each row
interface CourseData {
  term: string; // Changed from semester and year to term
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

interface SectionInfo {
  term: string;
  section: string;
  instructor: string;
  averageGPA: number;
}

export function SubjectTable({ selectedQuery }: SubjectTableProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get('query');
  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseChartData, setCourseChartData] = useState<any[]>([]);
  const [sectionInfos, setSectionInfos] = useState<SectionInfo[]>([]);

  // Memoize processChartData function
  const processChartData = useCallback((data: CourseData[]) => {
    const termMap = new Map<string, { [instructor: string]: number[] }>();

    // Group data by term and instructor
    data.forEach((item) => {
      if (!termMap.has(item.term)) {
        termMap.set(item.term, {});
      }
      const termData = termMap.get(item.term)!;
      if (!termData[item.instructorName]) {
        termData[item.instructorName] = [];
      }
      termData[item.instructorName].push(item.averageGPA);
    });

    // Calculate averages and format data for the chart
    const chartData = Array.from(termMap.entries()).map(([term, instructors]) => {
      const chartItem: any = { term };
      Object.entries(instructors).forEach(([instructor, gpas]) => {
        const avgGPA = gpas.reduce((sum, gpa) => sum + gpa, 0) / gpas.length;
        chartItem[instructor] = Number(avgGPA.toFixed(2));
      });
      return chartItem;
    });

    // Sort the chart data chronologically
    return chartData.sort((a, b) => {
      const [aSemester, aYear] = a.term.split(' ');
      const [bSemester, bYear] = b.term.split(' ');
      
      if (aYear !== bYear) {
        return parseInt(aYear) - parseInt(bYear);
      }
      
      const semesterOrder = { 'SPRING': 0, 'SUMMER': 1, 'FALL': 2 };
      return semesterOrder[aSemester as keyof typeof semesterOrder] - semesterOrder[bSemester as keyof typeof semesterOrder];
    });
  }, []);

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
            term: `${item.Semester} ${item.Year}`, // Combine semester and year into term
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
            averageGPA: parseFloat(item.Average_GPA) || null,
          }));

          setCourseData(processedData);

          // Create sectionInfos array
          const newSectionInfos: SectionInfo[] = processedData.map(item => ({
            term: item.term,
            section: item.section,
            instructor: item.instructorName,
            averageGPA: item.averageGPA
          }));
          setSectionInfos(newSectionInfos);
          console.log('Section Infos:', sectionInfos);

          // Process data for the chart
          const chartData = processChartData(processedData);
          setCourseChartData(chartData);
          console.log('Chart data processed:', chartData);
        } catch (error) {
          console.error('Failed to fetch course data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchCourseData();
    }
  }, [query, processChartData]);

  // New useEffect to log courseChartData when it changes
  useEffect(() => {
    console.log('courseChartData updated:', courseChartData);
  }, [courseChartData]);

  console.log('SubjectTable rendering, courseChartData length:', courseChartData.length);

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
      <Table.Td>{item.term}</Table.Td> {/* Display term instead of semester and year */}
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
    // Displaying Section Title
    <Container size="lg" style={{ marginTop: '20px' }}>
      <div>
        <Title order={1} style={{ marginBottom: '5px', marginTop: '0px' }}>
          {query}
        </Title>

        {/* Display averages below title (WIP) */}
        {/* <Tooltip
          label="Average GPA"
          position="bottom"
          offset={5}
          transitionProps={{ transition: 'fade-down', duration: 300 }}
        >
          <Badge color="blue" style={{ marginRight: '10px' }}>
            Average GPA
          </Badge>
        </Tooltip>
        <Tooltip
          label="Drop/Withdraw Rate"
          position="bottom"
          offset={5}
          transitionProps={{ transition: 'fade-down', duration: 300 }}
        >
          <Badge color="red">Drop/Withdraw Rate</Badge>
        </Tooltip> */}
      </div>
      <Divider my="md" size={8} label="Data" />
      <div>
        <Title order={4} style={{ marginBottom: '20px' }}>{query} Average GPA over time by Instructor</Title>
        <BarChart
          h={300}
          data={courseChartData}
          dataKey="term"
          series={
            getAllInstructors(courseChartData).map((instructor, index) => ({
              name: instructor,
              color: `var(--mantine-color-${['indigo', 'blue', 'teal', 'cyan', 'green', 'yellow', 'orange', 'red'][index % 8]}-6)`,
            }))
          }
          tickLine="y"
          yAxisProps={{ domain: [0, 4] }} // Assuming GPA range is 0-4
          withLegend
          orientation="horizontal"
          tooltipAnimationDuration={200}
          legendProps={{ verticalAlign: 'bottom', height: 50 }}
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
            <Table.Th>Term</Table.Th> {/* Change Semester and Year to Term */}
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

// Move this function outside of useCallback
const getAllInstructors = (data: any[]) => {
  const instructors = new Set<string>();
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key !== 'term') instructors.add(key);
    });
  });
  return Array.from(instructors);
};
