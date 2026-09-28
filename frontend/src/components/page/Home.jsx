import React from "react";
import Herosection from "../ui/Herosection";

import Abouts from "./Abouts";
import KeyFeatures from "../ui/Keyfeatures";

// import Abouts from './Abouts'
import Services from "./Services";
import DigitalAlifeShowcase from "../ui/Digitalalifeshowcase";
import IndustriesWeServe from "../ui/Industriesweserve";
import WhyChooseDigitalAlife from "../ui/Whychoosedigitalalife";
import OurClients from "../ui/Ourclients";
import OfficeAndReviews from "../ui/Officeandreviews";
import VideoSection from "./VideoSection";

function Home() {
  return (
    <>
      <div>
        <Herosection />
      </div>
      <div>
        <Services />
      </div>
      <div>
        <DigitalAlifeShowcase />
      </div>
      <div>
        <IndustriesWeServe />
      </div>
      <div>
      <VideoSection />
      </div>
      <div>
        <WhyChooseDigitalAlife />
      </div>
      <div>
        <OurClients />
      </div>
      <div>
        <OfficeAndReviews />
      </div>
      <div>
        <KeyFeatures />
      </div>
    </>
  );
}



export default Home;
