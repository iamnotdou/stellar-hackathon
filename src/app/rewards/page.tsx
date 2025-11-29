"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function EarnRewardsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-5xl mx-auto md:px-0">
        {/* Header Section */}
        <div className="border border-t-0 corner-accents">
          <div className="p-8 md:p-12 space-y-4">
            <div className="inline-block border corner-accents bg-accent/5 text-accent px-3 py-1 text-xs font-bold">
              [REWARDS_SYSTEM]
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
              Earn Rewards
            </h1>
            <p className="text-muted-foreground text-sm">
              &gt; GAMIFICATION_MODULE // COMING_SOON
            </p>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="border border-t-0 corner-accents">
          <div className="p-12 md:p-24">
            <div className="max-w-md mx-auto">
              <div className="border corner-accents p-8 bg-muted/5 space-y-6 text-center">
                <div className="border corner-accents w-16 h-16 bg-accent/10 flex items-center justify-center mx-auto">
                  <div className="text-2xl">🎮</div>
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold">[DEVELOPMENT_IN_PROGRESS]</h2>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>&gt; REWARDS_SYSTEM_INITIALIZING</p>
                    <p>&gt; GAMIFICATION_FEATURES_LOADING</p>
                    <p>&gt; COMING_SOON...</p>
                  </div>
                </div>
                <div className="border corner-accents bg-accent/5 text-accent px-4 py-3">
                  <span className="text-sm font-bold">Coming soon...</span>
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