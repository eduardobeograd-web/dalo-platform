import HomeClient from "../components/HomeClient";
import {
  HomeFaq,
  HomeFooter,
  HomeHowItWorks,
  HomeWhyDalo,
} from "../components/HomeStaticSections";

export default function Home() {
  return (
    <HomeClient
      whyDalo={<HomeWhyDalo />}
      howItWorks={<HomeHowItWorks />}
      faq={<HomeFaq />}
      footer={<HomeFooter />}
    />
  );
}
