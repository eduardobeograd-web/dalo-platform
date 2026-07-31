import HomeHeroQuiz from "../components/HomeHeroQuiz";
import {
  HomeFaq,
  HomeFooter,
  HomeHowItWorks,
  HomePopularDestinations,
  HomeWhyDalo,
} from "../components/HomeStaticSections";

export default function Home() {
  return (
    <main className="dalo-home min-h-screen bg-[#F6F8FF] text-slate-900">
      <HomeHeroQuiz />
      <HomeWhyDalo />
      <HomeHowItWorks />
      <HomePopularDestinations />
      <HomeFaq />
      <HomeFooter />
    </main>
  );
}
