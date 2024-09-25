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
  Alert,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import classes from './Welcome.module.css';

const mockdata = [
  {
    "title": "Data",
    "description": "Courses and Instructors from 2019 to 2024 (excluding summer/fall 2024) are available. More data will be added in the future.",
    "icon": "",
  },
  {
    "title": "Updates",
    "description": (
      <>
        Not every course is available for every term. Check out the latest updates to see what's available. Database is still in the early stages, but more courses will be added soon.
      </>
    ),
    "icon": "",
  }
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
      <Title className={classes.title} ta="center" style={{ marginTop: '100px' }}>
        Welcome to{' '}
        <Text inherit variant="gradient" component="span" gradient={{ from: 'pink', to: 'yellow' }}>
          AggieGrade
        </Text>
      </Title>
      <Text c="dimmed" ta="center" size="lg" mx="auto" mt="xl">
        {' '}
        View and analyze grade distribution data for past Texas A&M University courses and instructors.
      </Text>

      <Container size="lg" py="xl">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" mt={50}>
          {features}
        </SimpleGrid>
        <Alert variant="filled" color="rgba(107, 20, 20, 1)" title="Disclaimer" icon={<IconInfoCircle />} style={{ marginTop: '20px' }}>
          If a course description and title does not display, that means the course was not found on the A&M course catalog.
        </Alert>
      </Container>
    </>
  );
}
