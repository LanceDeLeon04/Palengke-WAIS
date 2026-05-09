import { HeroSection, FeaturesSection, ApiSection, CtaSection } from '../components/landing/Landing.jsx'

export default function LandingPage() {
  return (
    <div className="page-in">
      <HeroSection />
      <FeaturesSection />
      <ApiSection />
      <CtaSection />
    </div>
  )
}
