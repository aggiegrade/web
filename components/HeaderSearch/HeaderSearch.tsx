'use client';
import React, { useEffect, useState } from 'react';
import { Autocomplete, Group, Burger, rem, Drawer, ScrollArea, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { ActionToggle } from '../ActionToggle/ActionToggle';
import classes from './HeaderSearch.module.css';
import Link from 'next/link';

// Define the subjct and course data structure
interface SubjectAndCourse {
  SubjectCode: string;
  Course: string;
}

// Navigation links for header
const links = [
  { link: '/', label: 'Home' },
  { link: '/', label: 'Instructors' },
  { link: '/subject', label: 'Subjects' },
  { link: '/', label: 'Random' },
  { link: '/', label: 'FAQ' },
  { link: '/', label: 'About' },
];

export function HeaderSearch() {
  const [opened, { toggle, close }] = useDisclosure(false); // Managing drawer (mobile menu) statement
  const [instructorNames, setInstructorNames] = useState<string[]>([]); // Statement to store instructor names
  const [subjectAndCourses, setSubjectAndCourses] = useState<string[]>([]); // Statement to store subject and course combinations

  // Mapping nav links to JSX elements
  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={classes.link}
      onClick={(event) => event.preventDefault()}
    >
      {link.label}
    </a>
  ));

  // Fetch data when component first mounts
  useEffect(() => {
    // Fetch instructors from the API
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
        // console.log('Instructors API Result:', instructors); // Debug statement
      } catch (error) {
        console.error('Failed to fetch instructors:', error);
      }
    };

    // Fetch subject and course data from the API
    const fetchSubjectAndCourses = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/subject-and-course`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const subjectsAndCourses: SubjectAndCourse[] = await response.json(); // Explicitly type the response
        const formattedSubjectAndCourses = subjectsAndCourses.map(
          (item) => `${item.SubjectCode} ${item.Course}`
        );
        const uniqueSubjectAndCourses = Array.from(new Set(formattedSubjectAndCourses)); // Remove duplicates because mantine does not support duplicate entries in autocomplete
        setSubjectAndCourses(uniqueSubjectAndCourses);
        // console.log('Subject and Course API Result:', subjectsAndCourses); // Debug statement
      } catch (error) {
        console.error('Failed to fetch subject and courses:', error);
      }
    };

    // Initiate fetch calls
    fetchInstructors();
    fetchSubjectAndCourses();
  }, []);

  // Mapping drawer items to JSX elements for mobile view
  const drawerItems = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={classes.drawerLink}
      onClick={(event) => event.preventDefault()}
    >
      {link.label}
    </a>
  ));

  return (
    <header className={classes.header}>
      {/* Burger icon for mobile */}
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
            console.log('Selected item:', item);
            // Store the selected item string
          }}
        />

        <Group className={classes.links} visibleFrom="sm">
          {items}
          <ActionToggle />
        </Group>
      </div>

      {/* Mobile Menu Drawer */}
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
