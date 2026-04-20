import Navbar          from '@/components/Navbar';
import Hero            from '@/components/Hero';
import About           from '@/components/About';
import Subdivisions    from '@/components/Subdivisions';
import Benefits        from '@/components/Benefits';
import Requirements    from '@/components/Requirements';
import JoinProcess     from '@/components/JoinProcess';
import ApplicationForm from '@/components/ApplicationForm';
import Footer          from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <Subdivisions />
      <Benefits />
      <Requirements />
      <JoinProcess />
      <ApplicationForm />
      <Footer />
    </main>
  );
}
