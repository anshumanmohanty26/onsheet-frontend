import { CTA, Features, Footer, Hero, Navbar, StatsAndTestimonials } from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <StatsAndTestimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
