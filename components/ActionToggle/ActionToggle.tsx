import { Switch, useMantineTheme, rem, Group } from '@mantine/core';
import { IconSun, IconMoonStars } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';
import { useEffect, useState } from 'react';

export function ActionToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent SSR mismatch

  const sunIcon = (
    <IconSun
      style={{ width: rem(16), height: rem(16) }}
      stroke={2.5}
      color={theme.colors.yellow[4]}
    />
  );

  const moonIcon = (
    <IconMoonStars
      style={{ width: rem(16), height: rem(16) }}
      stroke={2.5}
      color={theme.colors.blue[6]}
    />
  );

  const handleToggle = () => {
    toggleColorScheme();
  };

  return (
    <Group align="center">
      <Switch
        size="md"
        color="dark.4"
        onLabel={sunIcon}
        offLabel={moonIcon}
        checked={colorScheme === 'dark'}
        onChange={handleToggle}
      />
    </Group>
  );
}
