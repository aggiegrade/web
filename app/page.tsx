import { Welcome } from '../components/Welcome/Welcome';
import { HeaderSearch } from '../components/HeaderSearch/HeaderSearch';
import { Footer } from '../components/Footer/Footer';

export default function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HeaderSearch />
      <div style={{ flex: 1 }}>
        <Welcome />
      </div>
      <Footer />
    </div>
  );
}
