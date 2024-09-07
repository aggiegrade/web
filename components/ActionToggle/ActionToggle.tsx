import { Switch, useMantineTheme, rem, Group } from '@mantine/core';
import { IconSun, IconMoonStars } from '@tabler/icons-react';
import { useMantineColorScheme, useComputedColorScheme } from '@mantine/core';

export function ActionToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const theme = useMantineTheme();

  // Icons for the switch
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

  // Handler to toggle color scheme
  const handleToggle = () => {
    setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light');
  };

  return (
    <Group justify="center">
      <Switch
        size="md"
        color="dark.4"
        onLabel={sunIcon}
        offLabel={moonIcon}
        checked={computedColorScheme === 'dark'}
        onChange={handleToggle}
      />
    </Group>
  );
}
