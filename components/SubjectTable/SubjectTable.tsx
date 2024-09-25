'use client';
import { Table, Loader, Text, Container, Title, Tooltip, Badge, Divider } from '@mantine/core';
import { AreaChart, LineChart, BarChart, DonutChart, PieChart } from '@mantine/charts';
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import parse, { domToReact } from 'html-react-parser'; // Import html-react-parser and domToReact
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
  const [courseInfo, setCourseInfo] = useState<any>(null); // New state for course information

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

      const semesterOrder = { SPRING: 0, SUMMER: 1, FALL: 2 };
      return (
        semesterOrder[aSemester as keyof typeof semesterOrder] -
        semesterOrder[bSemester as keyof typeof semesterOrder]
      );
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
          const newSectionInfos: SectionInfo[] = processedData.map((item) => ({
            term: item.term,
            section: item.section,
            instructor: item.instructorName,
            averageGPA: item.averageGPA,
          }));
          setSectionInfos(newSectionInfos);
          // console.log('Section Infos:', sectionInfos); // Debugging

          // Process data for the chart
          const chartData = processChartData(processedData);
          setCourseChartData(chartData);
          // console.log('Chart data processed:', chartData); // Debugging
        } catch (error) {
          console.error('Failed to fetch course data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchCourseData();
    }
  }, [query, processChartData]);

  // New useEffect to fetch course information
  useEffect(() => {
    if (query) {
      const fetchCourseInfo = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/course-information`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ alias: query }),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          setCourseInfo(data);
        } catch (error) {
          console.error('Failed to fetch course information:', error);
        }
      };

      fetchCourseInfo();
    }
  }, [query]);

  // Transform function to modify HTML elements
  const transform = (node: any) => {
    if (node.type === 'tag' && node.name === 'a') {
      // Remove hyperlinks but keep the text
      return <span>{domToReact(node.children)}</span>;
    }
    if (node.type === 'tag' && node.name === 'span' && node.attribs.class === 'hours') {
      // Add indentation after the first </span>
      return (
        <>
          {domToReact(node.children)}
          <br />
          <br />
        </>
      );
    }
    if (node.type === 'tag' && node.name === 'strong' && node.parent && node.parent.name === 'p') {
      // Add indentation before the second <strong>
      return (
        <>
          <br />
          <br />
          {domToReact(node.children)}
        </>
      );
    }
  };

  // New variables to store course information
  const courseCode = courseInfo?.code;
  const courseTitle = courseInfo?.title;
  const courseDescription = courseInfo?.description
    ? parse(courseInfo.description, { replace: transform })
    : '';

  // Calculate average GPA and drop/withdraw rate
  const totalGPA = courseData.reduce((sum, item) => sum + item.averageGPA * item.totalStudents, 0);
  const totalStudents = courseData.reduce((sum, item) => sum + item.totalStudents, 0);
  const averageGPA = totalStudents ? (totalGPA / totalStudents).toFixed(2) : 'N/A';

  const totalDroppedWithdrawn = courseData.reduce((sum, item) => sum + item.droppedWithdrawn, 0);
  const dropWithdrawRate = totalStudents
    ? ((totalDroppedWithdrawn / totalStudents) * 100).toFixed(2)
    : 'N/A';

  // Calculate basic information
  const terms = courseData.map((item) => item.term);
  const sortedTerms = terms.sort((a, b) => {
    const [aSemester, aYear] = a.split(' ');
    const [bSemester, bYear] = b.split(' ');

    if (aYear !== bYear) {
      return parseInt(aYear) - parseInt(bYear);
    }

    const semesterOrder = { SPRING: 0, SUMMER: 1, FALL: 2 };
    return (
      semesterOrder[aSemester as keyof typeof semesterOrder] -
      semesterOrder[bSemester as keyof typeof semesterOrder]
    );
  });
  const earliestRecord = sortedTerms.length ? sortedTerms[0] : 'N/A';
  const latestRecord = sortedTerms.length ? sortedTerms[sortedTerms.length - 1] : 'N/A';
  const instructors = new Set(courseData.map((item) => item.instructorName));
  const numberOfInstructors = instructors.size;
  const numberOfSections = courseData.length;
  const averageStudentsPerSection = numberOfSections
    ? Math.ceil(totalStudents / numberOfSections)
    : 'N/A';

  // New useEffect to log courseChartData when it changes
  useEffect(() => {
    // console.log('courseChartData updated:', courseChartData); // Debugging
  }, [courseChartData]);

  // console.log('SubjectTable rendering, courseChartData length:', courseChartData.length); // Debugging

  if (loading) {
    return (
      <div>
        <Loader size="lg" />
        <Text>Loading course data...</Text>
      </div>
    );
  }

  // Aggregate student grades for the DonutChart
  const gradeCounts = courseData.reduce(
    (acc, item) => {
      acc.a += item.a;
      acc.b += item.b;
      acc.c += item.c;
      acc.d += item.d;
      acc.f += item.f;
      acc.q += item.droppedWithdrawn;
      acc.i += item.incomplete;
      acc.s += item.satisfactory;
      acc.u += item.unsatisfactory;
      acc.x += item.noGrade;
      return acc;
    },
    { a: 0, b: 0, c: 0, d: 0, f: 0, q: 0, i: 0, s: 0, u: 0, x: 0 }
  );

  const donutChartData = [
    { name: 'A', value: gradeCounts.a, color: 'green' },
    { name: 'B', value: gradeCounts.b, color: 'blue' },
    { name: 'C', value: gradeCounts.c, color: 'yellow' },
    { name: 'D', value: gradeCounts.d, color: 'orange' },
    { name: 'F', value: gradeCounts.f, color: 'red' },
    { name: 'Dropped/Withdrawn', value: gradeCounts.q, color: 'gray' },
    { name: 'Incomplete', value: gradeCounts.i, color: 'purple' },
    { name: 'Satisfactory', value: gradeCounts.s, color: 'teal' },
    { name: 'Unsatisfactory', value: gradeCounts.u, color: 'pink' },
    { name: 'No Grade', value: gradeCounts.x, color: 'brown' },
  ];

  // Map course data to rows
  const rows = courseData.map((item, index) => (
    <Table.Tr key={index}>
      <React.Fragment>
        <Table.Td>{item.term.trim()}</Table.Td>
        <Table.Td>{item.section.trim()}</Table.Td>
        <Table.Td>{item.instructorName.trim()}</Table.Td>
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
      </React.Fragment>
    </Table.Tr>
  ));
  
  

  return (
    // Displaying Section Title
    <Container size="lg" style={{ marginTop: '20px' }}>
      <div>
        <Title order={1} style={{ marginBottom: '5px', marginTop: '0px' }}>
          {query}: {courseTitle}
        </Title>

        {/* Display averages below title */}
        <Tooltip
          label="Grade Point Average"
          position="bottom"
          offset={5}
          transitionProps={{ transition: 'fade-down', duration: 300 }}
        >
          <Badge color="blue" style={{ marginRight: '10px' }}>
            {averageGPA} GPA
          </Badge>
        </Tooltip>
        <Tooltip
          label="Drop/Withdraw Rate"
          position="bottom"
          offset={5}
          transitionProps={{ transition: 'fade-down', duration: 300 }}
        >
          <Badge color="red">{dropWithdrawRate}% D/W</Badge>
        </Tooltip>

        {/* Display course information */}
        {courseInfo && (
          <div>
            <Text>{courseDescription}</Text>
          </div>
        )}
      </div>

      <Divider my="md" size={8} label="Basic Information" />
      <div>
        <Text>Earliest Record: {earliestRecord}</Text>
        <Text>Latest Record: {latestRecord}</Text>
        <Text># of Instructors: {numberOfInstructors}</Text>
        <Text># of Sections: {numberOfSections}</Text>
        <Text>Average # of Students per Section: {averageStudentsPerSection}</Text>
      </div>

      <Divider my="md" size={8} label="Data" />
      <div>
        <Title order={4} style={{ marginBottom: '20px' }}>
          Average GPA over time by Instructor
        </Title>
        <BarChart
          xAxisLabel="Term"
          yAxisLabel="Average GPA"
          h={300}
          data={courseChartData}
          dataKey="term"
          series={getAllInstructors(courseChartData).map((instructor, index) => ({
            name: instructor,
            color: `var(--mantine-color-${['indigo', 'blue', 'teal', 'cyan', 'green', 'yellow', 'orange', 'red'][index % 8]}-6)`,
          }))}
          tickLine="y"
          yAxisProps={{ domain: [0, 4] }} // Assuming GPA range is 0-4
          withLegend
          orientation="horizontal"
          tooltipAnimationDuration={200}
          legendProps={{ verticalAlign: 'bottom', height: 80 }}
        />
      </div>

      <Divider my="md" size={10} label="Student Grades" style={{ marginTop: '50px' }} />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <PieChart
          data={donutChartData}
          size={300}
          withLabels
          withTooltip
          labelsPosition="outside"
          labelsType="percent"
          strokeWidth={1}
          tooltipDataSource='segment'
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
            <Tooltip
              label="Total number of students who have been enrolled in this course"
              transitionProps={{ transition: 'scale-y', duration: 300 }}
            >
              <Table.Th># Enrolled</Table.Th>
            </Tooltip>
            <Tooltip
              label="Number of A's given for this section"
              transitionProps={{ transition: 'scale-y', duration: 300 }}
            >
              <Table.Th>A</Table.Th>
            </Tooltip>
            <Tooltip
              label="Number of B's given for this section"
              transitionProps={{ transition: 'scale-y', duration: 300 }}
            >
              <Table.Th>B</Table.Th>
            </Tooltip>
            <Tooltip
              label="Number of C's given for this section"
              transitionProps={{ transition: 'scale-y', duration: 300 }}
            >
              <Table.Th>C</Table.Th>
            </Tooltip>
            <Tooltip
              label="Number of D's given for this section"
              transitionProps={{ transition: 'scale-y', duration: 300 }}
            >
              <Table.Th>D</Table.Th>
            </Tooltip>
            <Tooltip
              label="Number of F's given for this section"
              transitionProps={{ transition: 'scale-y', duration: 300 }}
            >
              <Table.Th>F</Table.Th>
            </Tooltip>
            <Tooltip
              label="Dropped/Withdrawn"
              transitionProps={{ transition: 'scale-y', duration: 300 }}
            >
              <Table.Th>Q</Table.Th>
            </Tooltip>
            <Tooltip label="Incomplete" transitionProps={{ transition: 'scale-y', duration: 300 }}>
              <Table.Th>I</Table.Th>
            </Tooltip>
            <Tooltip
              label="Satisfactory"
              transitionProps={{ transition: 'scale-y', duration: 300 }}
            >
              <Table.Th>S</Table.Th>
            </Tooltip>
            <Tooltip
              label="Unsatisfactory"
              transitionProps={{ transition: 'scale-y', duration: 300 }}
            >
              <Table.Th>U</Table.Th>
            </Tooltip>
            <Tooltip label="No Grade" transitionProps={{ transition: 'scale-y', duration: 300 }}>
              <Table.Th>X</Table.Th>
            </Tooltip>
            <Tooltip
              label="Grade Point Average for this section"
              transitionProps={{ transition: 'scale-y', duration: 300 }}
            >
              <Table.Th>Average GPA</Table.Th>
            </Tooltip>
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
  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (key !== 'term') instructors.add(key);
    });
  });
  return Array.from(instructors);
};
