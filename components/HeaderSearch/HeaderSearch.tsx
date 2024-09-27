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
  { link: '/random', label: 'Random' },
  // { link: '/', label: 'FAQ' },
  // { link: '/', label: 'About' },
];

export function HeaderSearch() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [opened, { toggle, close }] = useDisclosure(false);
  const [instructorNames, setInstructorNames] = useState<string[]>([]);
  const [subjectAndCourses, setSubjectAndCourses] = useState<string[]>([]);

  const handleSearch = (item: string, group: string) => {
    setSearchTerm(item);

    // Route based on the group (Instructors or Courses)
    if (group === 'Instructors') {
      router.push(`/instructor?instructor=${encodeURIComponent(item)}`);
    } else {
      router.push(`/subject?query=${encodeURIComponent(item)}`);
    }
  };

  // Function to randomly select between instructors or courses
  const handleRandomSelection = () => {
    const allItems = [...subjectAndCourses, ...instructorNames];
    const randomItem = allItems[Math.floor(Math.random() * allItems.length)];

    // Determine whether the selected item is an instructor or a course
    const group = instructorNames.includes(randomItem) ? 'Instructors' : 'Courses';
    const url = group === 'Instructors'
      ? `/instructor?instructor=${encodeURIComponent(randomItem)}`
      : `/subject?query=${encodeURIComponent(randomItem)}`;

    // Use window.location.href to force a full page reload
    window.location.href = url;
  };

  const items = links.map((link) => (
    link.label === 'Random'
    ? <div 
        key={link.label} 
        className={classes.link} 
        onClick={handleRandomSelection}
        style={{ cursor: 'pointer' }}
      >
        {link.label}
      </div>
    : <Link href={link.link} key={link.label} className={classes.link}>{link.label}</Link>
  ));

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/instructors`);
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subject-and-course`);
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
    link.label === 'Random'
    ? <div 
        key={link.label} 
        className={classes.drawerLink} 
        onClick={handleRandomSelection} 
        style={{ cursor: 'pointer' }}
      >
        {link.label}
      </div>
    : <Link href={link.link} key={link.label} className={classes.drawerLink}>
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
          placeholder="Search for a Course/Instructor"
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
          limit={5}
          maxDropdownHeight={500}
          visibleFrom="xs"
          onOptionSubmit={(item) => {
            // Determine if the selected item is an instructor or a course
            const group = instructorNames.includes(item) ? 'Instructors' : 'Courses';
            handleSearch(item, group);
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
