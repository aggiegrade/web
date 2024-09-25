'use client';
import { Table, Loader, Text, Container, Title, Divider, Tooltip, Badge } from '@mantine/core';
import { BarChart, DonutChart, PieChart } from '@mantine/charts';
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

    // console.log('Processed chart data:', Array.from(termCourseMap.entries())); // Debugging

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
          // console.log('Instructor Chart Data:', chartData); // Debugging
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

  // Calculate average GPA and drop/withdraw rate
  const totalGPA = sectionsData.reduce((sum, item) => sum + item.averageGPA * item.totalStudents, 0);
  const totalStudents = sectionsData.reduce((sum, item) => sum + item.totalStudents, 0);
  const averageGPA = totalStudents ? (totalGPA / totalStudents).toFixed(2) : 'N/A';

  const totalDroppedWithdrawn = sectionsData.reduce((sum, item) => sum + item.droppedWithdrawn, 0);
  const dropWithdrawRate = totalStudents
    ? ((totalDroppedWithdrawn / totalStudents) * 100).toFixed(2)
    : 'N/A';

  // Calculate basic information
  const terms = sectionsData.map((item) => `${item.semester.toUpperCase()} ${item.year}`);
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
  const courses = new Set(sectionsData.map((item) => `${item.subject} ${item.course}`));
  const numberOfCourses = courses.size;
  const numberOfSections = sectionsData.length;
  const averageStudentsPerSection = numberOfSections
    ? Math.ceil(totalStudents / numberOfSections)
    : 'N/A';

  // Aggregate student grades for the DonutChart
  const gradeCounts = sectionsData.reduce(
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
  ].filter(segment => segment.value > 0); // Filter out segments with zero value

  // Map sections data to rows, combining Semester + Year into "Term" and Subject + Course into "Course"
  const rows = sectionsData.map((item, index) => {
    const term = `${item.semester.toUpperCase()} ${item.year}`; // Combine Semester + Year into Term
    const course = `${item.subject} ${item.course}`; // Combine Subject + Course into Course

    return (
      <Table.Tr key={index}>
        <Table.Td>{term}</Table.Td><Table.Td>{course}</Table.Td><Table.Td>{item.section}</Table.Td><Table.Td>{item.departmentName}</Table.Td><Table.Td>{item.totalStudents}</Table.Td><Table.Td>{item.a}</Table.Td><Table.Td>{item.b}</Table.Td><Table.Td>{item.c}</Table.Td><Table.Td>{item.d}</Table.Td><Table.Td>{item.f}</Table.Td><Table.Td>{item.droppedWithdrawn}</Table.Td><Table.Td>{item.incomplete}</Table.Td><Table.Td>{item.satisfactory}</Table.Td><Table.Td>{item.unsatisfactory}</Table.Td><Table.Td>{item.noGrade}</Table.Td><Table.Td>{item.averageGPA}</Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Container size="lg" style={{ padding: '0px', marginTop: '20px' }}>
      <Title order={1} style={{ marginBottom: '5px' }}>
        {instructorName}
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

      <Divider my="md" size={8} label="Basic Information" />
      <div>
        <Text>Earliest Record: {earliestRecord}</Text>
        <Text>Latest Record: {latestRecord}</Text>
        <Text># of Courses: {numberOfCourses}</Text>
        <Text># of Sections: {numberOfSections}</Text>
        <Text>Average # of Students per Section: {averageStudentsPerSection}</Text>
      </div>

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
          legendProps={{ verticalAlign: 'bottom', height: 80 }}
          xAxisLabel="Term"
          yAxisLabel="GPA"
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
            <Table.Th>Term</Table.Th> {/* Combined Semester + Year */}
            <Table.Th>Course</Table.Th> {/* Combined Subject + Course */}
            <Table.Th>Section</Table.Th>
            <Table.Th>Department</Table.Th>
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
      </Table>
    </Container>
  );
}
