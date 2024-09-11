"use client";
import { useEffect, useState } from 'react';
import { Anchor, Group, ActionIcon, rem, Text } from '@mantine/core';
import { IconBrandTwitter, IconBrandYoutube, IconBrandInstagram, IconBrandGithub } from '@tabler/icons-react';
import classes from '../Footer/Footer.module.css';

const links = [
  { link: '/', label: '' },
  // { link: '/', label: 'Privacy' },
  // { link: '/', label: 'Blog' },
  // { link: '/', label: 'Store' },
  // { link: '/', label: 'Careers' },
];

export function Footer() {
  const [latestCommit, setLatestCommit] = useState<string | null>(null);
  const [commitUrl, setCommitUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the latest commit from GitHub API
    const fetchLatestCommit = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/aggiegrade/web/commits/main', {
          headers: {
            Authorization: `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
          },
        });
        const data = await response.json();
        const commitSha = data.sha;
        const commitUrl = data.html_url;
        setLatestCommit(commitSha);
        setCommitUrl(commitUrl);
      } catch (error) {
        console.error('Failed to fetch latest commit:', error);
      }
    };

    fetchLatestCommit();
  }, []);

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

        <Group className={classes.links}>
            Version 0.2, Commit:
            {latestCommit ? (
              <Anchor href={commitUrl || undefined} className={classes.commitLink}>
                {latestCommit.slice(0, 7)} {/* Show only the first 7 characters of the commit SHA */}
              </Anchor>
            ) : (
              'Loading...'
            )}
            {items}
        </Group>

        <Group gap="xs" justify="flex-end" wrap="nowrap">
          <a href="https://github.com/aggiegrade" target="_blank" rel="noopener noreferrer">
          <ActionIcon size="lg" variant="default" radius="xl">
            <IconBrandGithub style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
          </ActionIcon>
          </a>
        </Group>
      </div>
    </div>
  );
}