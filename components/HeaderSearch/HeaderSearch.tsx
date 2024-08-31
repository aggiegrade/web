"use client";
import { Autocomplete, Group, Burger, rem, Drawer, ScrollArea, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { ActionToggle } from '../ActionToggle/ActionToggle';
import classes from './HeaderSearch.module.css';
import Link from 'next/link';

const links = [
  { link: '/', label: 'Home' },
  { link: '/', label: 'Instructors' },
  { link: '/', label: 'Subjects' },
  { link: '/', label: 'Random' },
  { link: '/', label: 'FAQ' },
  { link: '/', label: 'About' },
];

export function HeaderSearch() {
  const [opened, { toggle, close }] = useDisclosure(false);

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

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <div className={classes.logo}>AggieGrade</div>

        <Autocomplete
          className={classes.search}
          placeholder="Search"
          leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
          data={['MATH', 'PSYC', 'ACCT', 'CYBR', 'FORS', 'POLS', 'STAT']}
          visibleFrom="xs"
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
        title="Menu"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
          <Stack>
            {items}
          </Stack>
        </ScrollArea>
      </Drawer>
    </header>
  );
}
