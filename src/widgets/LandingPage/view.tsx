import HeaderView from "@widgets/Header";
import React from "react";
import HeroText from "./components/HeroText";
import FooterView from "@widgets/Footer";

export default function LandingPageView() {
  return (
    <main>
      <HeaderView />
      <HeroText/>
      <FooterView/>
    </main>
  );
}
