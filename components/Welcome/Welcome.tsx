"use client";
import {
  Title,
  Text,
  Anchor,
  Group,
  Badge,
  Card,
  SimpleGrid,
  Container,
  rem,
  useMantineTheme,
} from '@mantine/core';
import classes from './Welcome.module.css';

const mockdata = [
  {
    "title": "Courses",
    "description": "Explore detailed grade distributions for all courses offered at Texas A&M University. Analyze trends, average grades, and course difficulty to make informed decisions about your schedule.",
    "icon": "",
  },
  {
    "title": "Instructors",
    "description": "Find grade distributions by instructor. See how different professors grade and compare their teaching styles to choose the best fit for your learning experience.",
    "icon": "",
  },
  {
    "title": "Resources",
    "description": "Access a variety of resources, including study guides, past exams, and other academic tools to help you succeed in your courses at Texas A&M University.",
    "icon": "",
  }
  ,
];

export function Welcome() {
  const theme = useMantineTheme();
  const features = mockdata.map((feature) => (
    <Card key={feature.title} shadow="md" radius="md" className={classes.card} padding="xl">
      <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
        {feature.title}
      </Text>
      <Text fz="sm" c="dimmed" mt="sm" className={classes.cardDesc}>
        {feature.description}
      </Text>
    </Card>
  ));
  return (
    <>
      <Title className={classes.title} ta="center">
        Welcome to{' '}
        <Text inherit variant="gradient" component="span" gradient={{ from: 'pink', to: 'yellow' }}>
          AggyGrades
        </Text>
      </Title>
      <Text c="dimmed" ta="center" size="lg" mx="auto" mt="xl">
        {' '}
        View and analyze grade distribution data for any past Texas A&M University course
      </Text>

      <Container size="lg" py="xl">


        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={50}>
          {features}
        </SimpleGrid>
      </Container>

    </>
  );
}
