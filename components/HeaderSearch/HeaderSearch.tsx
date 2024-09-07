'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Autocomplete, Group, Burger, rem, Drawer, ScrollArea, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { ActionToggle } from '../ActionToggle/ActionToggle';
import classes from './HeaderSearch.module.css';
import Link from 'next/link';

interface SubjectAndCourse {
  SubjectCode: string;
  Course: string;
}

const links = [
  { link: '/', label: 'Home' },
  // { link: '/instructors', label: 'Instructors' },
  // { link: '/subject', label: 'Subjects' },
  { link: '/random', label: 'Random' },
  { link: '/faq', label: 'FAQ' },
  { link: '/about', label: 'About' },
];

export function HeaderSearch() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [opened, { toggle, close }] = useDisclosure(false);
  const [instructorNames, setInstructorNames] = useState<string[]>([]);
  const [subjectAndCourses, setSubjectAndCourses] = useState<string[]>([]);

  const handleSearch = (item: string) => {
    setSearchTerm(item);
    router.push(`/subject?query=${encodeURIComponent(item)}`);
  };

  const items = links.map((link) => (
    <Link href={link.link} key={link.label} className={classes.link}>
      {link.label}
    </Link>
  ));

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/instructors`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const instructors = await response.json();
        const names = instructors.map(
          (instructor: { instructorname: string }) => instructor.instructorname
        );
        setInstructorNames(names);
      } catch (error) {
        console.error('Failed to fetch instructors:', error);
      }
    };

    const fetchSubjectAndCourses = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/subject-and-course`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const subjectsAndCourses: SubjectAndCourse[] = await response.json();
        const formattedSubjectAndCourses = subjectsAndCourses.map(
          (item) => `${item.SubjectCode} ${item.Course}`
        );
        const uniqueSubjectAndCourses = Array.from(new Set(formattedSubjectAndCourses));
        setSubjectAndCourses(uniqueSubjectAndCourses);
      } catch (error) {
        console.error('Failed to fetch subject and courses:', error);
      }
    };

    fetchInstructors();
    fetchSubjectAndCourses();
  }, []);

  const drawerItems = links.map((link) => (
    <Link href={link.link} key={link.label} className={classes.drawerLink}>
      {link.label}
    </Link>
  ));

  return (
    <header className={classes.header}>
      <Burger
        opened={opened}
        onClick={toggle}
        className={classes.burger}
        size="sm"
        aria-label="Toggle menu"
        hiddenFrom="sm"
      />
      <div className={classes.inner}>
        <div className={classes.logo}>AggieGrade</div>

        <Autocomplete
          className={classes.search}
          placeholder="Search"
          leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
          data={[
            {
              group: 'Courses',
              items: subjectAndCourses,
            },
            {
              group: 'Instructors',
              items: instructorNames,
            },
          ]}
          limit={6}
          visibleFrom="xs"
          onOptionSubmit={(item) => {
            handleSearch(item);
          }}
        />

        <Group className={classes.links} visibleFrom="sm">
          {items}
          <ActionToggle />
        </Group>
      </div>

      <Drawer
        opened={opened}
        onClose={close}
        size="100%"
        padding="md"
        title={<div className={classes.drawerTitle}>Menu</div>}
        hiddenFrom="sm"
        zIndex={1000000}
        className={classes.drawer}
      >
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
          <Stack>
            {drawerItems}
            <ActionToggle />
          </Stack>
        </ScrollArea>
      </Drawer>
    </header>
  );
}
