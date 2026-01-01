import Image from "next/image";
import React from "react";

function Empty() {
  return <div className="border-conversation-border border-l w-full bg-panel-header-background flex flec-col items-center justify-center h-screen border-b-4 border-b-icon-green">
    <Image src={'/whatsapp.gif'} alt="instant" height={300} width={300} />
  </div>;
}

export default Empty;
