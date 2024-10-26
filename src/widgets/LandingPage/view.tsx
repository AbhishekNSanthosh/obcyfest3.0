import HeaderView from "@widgets/Header";
import React from "react";
import HeroText from "./components/HeroText";
import FooterView from "@widgets/Footer";
import Marquee from "./components/Marquee";
import About from "./components/About";

export default function LandingPageView() {
  return (
    <main>
      <HeaderView />
      <HeroText/>
      <Marquee/>
      <About/>
      <FooterView/>
    </main>
  );
}
