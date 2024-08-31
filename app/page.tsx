import { Welcome } from '../components/Welcome/Welcome';
import { HeaderSearch } from '../components/HeaderSearch/HeaderSearch'

export default function HomePage() {
  return (
    <>
      <HeaderSearch/>
      <Welcome />
      {/* <ColorSchemeToggle /> */}
    </>
  );
}
