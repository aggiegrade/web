"use client";
import { Anchor, Group, ActionIcon, rem, Text } from '@mantine/core';
import { IconBrandTwitter, IconBrandYoutube, IconBrandInstagram } from '@tabler/icons-react';
import classes from '../Footer/Footer.module.css';

const links = [
  { link: '/', label: 'Contact' },
  { link: '/', label: 'Privacy' },
  { link: '/', label: 'Blog' },
  { link: '/', label: 'Store' },
  { link: '/', label: 'Careers' },
];

export function Footer() {
  const items = links.map((link) => (
    <Anchor
      className={classes.linkItem}
      c="dimmed"
      key={link.label}
      href={link.link}
      lh={1}
      onClick={(event) => event.preventDefault()}
      size="sm"
    >
      {link.label}
    </Anchor>
  ));

  return (
    <div className={classes.footer}>
      <div className={classes.inner}>
        <Text size="md" fw={700}>
            aggiegrade/web
        </Text>
        {/* <MantineLogo size={28} /> */}

        <Group className={classes.links}>
            Version 0.0.1, Commit: 
            {items}
            </Group>

        <Group gap="xs" justify="flex-end" wrap="nowrap">
          <ActionIcon size="lg" variant="default" radius="xl">
            <IconBrandTwitter style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size="lg" variant="default" radius="xl">
            <IconBrandYoutube style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size="lg" variant="default" radius="xl">
            <IconBrandInstagram style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
          </ActionIcon>
        </Group>
      </div>
    </div>
  );
}