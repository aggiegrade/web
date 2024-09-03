import { SubjectTable } from '../../components/SubjectTable/SubjectTable';
import { HeaderSearch } from '../../components/HeaderSearch/HeaderSearch';
import { Footer } from '../../components/Footer/Footer';

export default function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <HeaderSearch />
      <div style={{ flex: 1 }}>
        <SubjectTable />
      </div>
      <Footer />
    </div>
  );
}
