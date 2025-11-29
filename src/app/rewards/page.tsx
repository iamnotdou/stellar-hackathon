"use client";

import dynamic from 'next/dynamic';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const FortuneWheel = dynamic(() => import('@/components/FortuneWheel'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-64">
      <div className="border corner-accents bg-accent/5 text-accent px-4 py-3">
        <span className="text-sm font-bold">Loading Fortune Wheel...</span>
      </div>
    </div>
  )
});

export default function EarnRewardsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-5xl mx-auto md:px-0">
        {/* Header Section */}
        <div className="border border-t-0 corner-accents">
          <div 
            className="p-8 md:p-12 space-y-4"
            style={{
              backgroundImage: `url(/WhatsApp%20Görsel%202025-11-29%20saat%2020.28.56_af709104.jpg)`,
              backgroundSize: "contain",
              backgroundPosition: "right center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="inline-block border corner-accents bg-accent/5 text-accent px-3 py-1 text-xs font-bold">
              [REWARDS_SYSTEM]
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
              Earn Rewards
            </h1>
            <p className="text-muted-foreground text-sm">
              &gt; GAMIFICATION_MODULE // 
            </p>
          </div>
        </div>

        {/* Fortune Wheel Section */}
        <div className="border border-t-0 corner-accents">
          <div className="p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              <div className="border corner-accents p-8 bg-muted/5 space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold">Fortune Wheel</h2>
                </div>
                
                {/* Fortune Wheel Component */}
                <div className="flex justify-center">
                  <FortuneWheel 
                    onWin={(prize) => {
                      // Prize won silently
                    }}
                    className="border corner-accents bg-black/20 p-4 rounded"
                  />
                </div>
                
                <div className="border corner-accents bg-accent/5 text-accent px-4 py-3 text-center">
                  <span className="text-sm font-bold">Spin the wheel to earn rewards!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}