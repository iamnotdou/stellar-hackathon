"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowUpRight, Upload, Plus, Minus } from "lucide-react";
import { useState } from "react";

export default function CreateEventPage() {
  const [quantity, setQuantity] = useState(100);
  const [royalty, setRoyalty] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = [
    { name: "Music", description: "Concerts, festivals, live performances" },
    { name: "Art", description: "Exhibitions, galleries, art shows" },
    { name: "Sports", description: "Games, tournaments, competitions" },
    { name: "Theater", description: "Plays, musicals, drama performances" },
    { name: "Conference", description: "Business, tech, educational events" },
    { name: "Festival", description: "Cultural, food, community festivals" },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <div className="max-w-5xl mx-auto md:px-0">
        {/* Header Section */}
        <div className="border border-t-0 corner-accents">
          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x">
            <div
              className="md:col-span-2 p-8 md:p-12 space-y-4 border-b md:border-b-0 relative"
            >
              <div 
                className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage: `url(/cave.png)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              ></div>
              <div className="relative z-10">
              <div className="inline-block border corner-accents bg-accent/5 text-accent px-3 py-1 text-xs font-bold">
                [EVENT_CREATOR]
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
                Create Event
              </h1>
              <p className="text-muted-foreground text-sm">
                &gt; DEPLOY_NEW_NFT_TICKET_CONTRACT
              </p>
              </div>
            </div>
            {/* Info */}
            <div className="flex flex-col divide-y">
              <div className="p-6 flex-1 flex flex-col justify-center hover:bg-muted/30 transition-colors">
                <div className="text-xs text-muted-foreground mb-1">
                  PLATFORM_FEE
                </div>
                <div className="text-2xl font-bold text-accent">0%</div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center hover:bg-muted/30 transition-colors">
                <div className="text-xs text-muted-foreground mb-1">
                  GAS_ESTIMATE
                </div>
                <div className="text-sm font-bold">~0.02 ETH</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="border border-t-0 corner-accents">
          <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x">
            {/* Main Form */}
            <div className="md:col-span-2 p-6 md:p-8 space-y-6 border-b md:border-b-0">
              {/* Category Selection Section */}
              {!selectedCategory ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold">[SELECT_CATEGORY]</h2>
                    <p className="text-sm text-muted-foreground">
                      Choose the category that best describes your event
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map((category) => (
                      <button
                        key={category.name}
                        onClick={() => setSelectedCategory(category.name)}
                        className="group border corner-accents p-6 text-left hover:bg-accent/5 hover:border-accent transition-colors space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold group-hover:text-accent transition-colors">
                            {category.name}
                          </h3>
                          <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Category Breadcrumb */}
                  <div className="flex items-center gap-2 text-sm">
                    <button 
                      onClick={() => setSelectedCategory("")}
                      className="text-accent hover:underline"
                    >
                      Categories
                    </button>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-medium">{selectedCategory}</span>
                  </div>

                  {/* Event Details Section */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold">[{selectedCategory.toUpperCase()}_EVENT_DETAILS]</h2>

                    {/* Common Fields */}
                    {/* Event Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground">
                        EVENT_NAME *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter event name..."
                        className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground">
                        DESCRIPTION *
                      </label>
                      <textarea
                        placeholder="Describe your event..."
                        rows={4}
                        className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors resize-none"
                      />
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground">
                          DATE *
                        </label>
                        <input
                          type="date"
                          className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground">
                          TIME *
                        </label>
                        <input
                          type="time"
                          className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground">
                        LOCATION *
                      </label>
                      <input
                        type="text"
                        placeholder="Event location or venue..."
                        className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
                      />
                    </div>

                    {/* Category Specific Fields */}
                    {selectedCategory === "Music" && (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground">
                            ARTIST_NAME *
                          </label>
                          <input
                            type="text"
                            placeholder="Main artist or band name..."
                            className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground">
                            GENRE
                          </label>
                          <input
                            type="text"
                            placeholder="Rock, Pop, Electronic..."
                            className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground">
                            AGE_RESTRICTION
                          </label>
                          <select className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors">
                            <option value="">No restriction</option>
                            <option value="16+">16+</option>
                            <option value="18+">18+</option>
                            <option value="21+">21+</option>
                          </select>
                        </div>
                      </>
                    )}

                    {selectedCategory === "Art" && (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground">
                            EXHIBITION_TYPE
                          </label>
                          <select className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors">
                            <option value="">Select type</option>
                            <option value="painting">Painting</option>
                            <option value="sculpture">Sculpture</option>
                            <option value="photography">Photography</option>
                            <option value="mixed">Mixed Media</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground">
                            CURATOR_NAME
                          </label>
                          <input
                            type="text"
                            placeholder="Exhibition curator..."
                            className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
                          />
                        </div>
                      </>
                    )}

                    {selectedCategory === "Sports" && (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground">
                            SPORT_TYPE *
                          </label>
                          <input
                            type="text"
                            placeholder="Football, Basketball, Tennis..."
                            className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground">
                            TEAMS_PLAYERS
                          </label>
                          <input
                            type="text"
                            placeholder="Team A vs Team B or player names..."
                            className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground">
                            LEAGUE_TOURNAMENT
                          </label>
                          <input
                            type="text"
                            placeholder="League or tournament name..."
                            className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
                          />
                        </div>
                      </>
                    )}

                    {selectedCategory === "Theater" && (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground">
                            PLAY_TITLE *
                          </label>
                          <input
                            type="text"
                            placeholder="Name of the play or performance..."
                            className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground">
                            DIRECTOR
                          </label>
                          <input
                            type="text"
                            placeholder="Director name..."
                            className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground">
                            THEATER_COMPANY
                          </label>
                          <input
                            type="text"
                            placeholder="Theater company or troupe..."
                            className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground">
                            DURATION
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., 2 hours, 90 minutes..."
                            className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
                          />
                        </div>
                      </>
                    )}

                    {selectedCategory === "Conference" && (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground">
                            CONFERENCE_TYPE
                          </label>
                          <select className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors">
                            <option value="">Select type</option>
                            <option value="business">Business</option>
                            <option value="technology">Technology</option>
                            <option value="academic">Academic</option>
                            <option value="medical">Medical</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground">
                            KEYNOTE_SPEAKERS
                          </label>
                          <textarea
                            placeholder="Main speakers and presenters..."
                            rows={3}
                            className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors resize-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground">
                            AGENDA_HIGHLIGHTS
                          </label>
                          <textarea
                            placeholder="Key topics and sessions..."
                            rows={3}
                            className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors resize-none"
                          />
                        </div>
                      </>
                    )}

                    {selectedCategory === "Festival" && (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground">
                            FESTIVAL_TYPE
                          </label>
                          <select className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors">
                            <option value="">Select type</option>
                            <option value="food">Food & Drink</option>
                            <option value="music">Music Festival</option>
                            <option value="cultural">Cultural</option>
                            <option value="arts">Arts & Crafts</option>
                            <option value="community">Community</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground">
                            DURATION_DAYS
                          </label>
                          <input
                            type="number"
                            placeholder="Number of days..."
                            min="1"
                            className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-muted-foreground">
                            ACTIVITIES
                          </label>
                          <textarea
                            placeholder="Main activities and attractions..."
                            rows={3}
                            className="w-full border corner-accents bg-transparent px-3 py-2 text-sm outline-none focus:border-accent transition-colors resize-none"
                          />
                        </div>
                      </>
                    )}

                    {/* Category - Selected */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground">
                        SELECTED_CATEGORY *
                      </label>
                      <div className="border corner-accents px-3 py-2 bg-accent/5 border-accent">
                        <span className="text-sm font-medium text-accent">{selectedCategory}</span>
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground">
                        EVENT_IMAGE *
                      </label>
                      <div className="border corner-accents aspect-video bg-muted/5 flex flex-col items-center justify-center gap-3 hover:bg-muted/10 transition-colors cursor-pointer">
                        <div className="border corner-accents w-16 h-16 bg-accent/10 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-accent" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold">[UPLOAD_IMAGE]</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            &gt; JPG, PNG, GIF • MAX_10MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Configuration */}
                </>
              )}
            </div>

            {/* Sidebar - Summary */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold">[SUMMARY]</h3>

                <div className="border corner-accents divide-y">
                  <div className="p-3 hover:bg-muted/30 transition-colors">
                    <div className="text-xs text-muted-foreground">
                      TOTAL_SUPPLY
                    </div>
                    <div className="font-bold text-accent">
                      {quantity} TICKETS
                    </div>
                  </div>
                  <div className="p-3 hover:bg-muted/30 transition-colors">
                    <div className="text-xs text-muted-foreground">ROYALTY</div>
                    <div className="font-bold">{royalty}%</div>
                  </div>
                  <div className="p-3 hover:bg-muted/30 transition-colors">
                    <div className="text-xs text-muted-foreground">
                      PLATFORM_FEE
                    </div>
                    <div className="font-bold text-accent">0 ETH</div>
                  </div>
                  <div className="p-3 hover:bg-muted/30 transition-colors">
                    <div className="text-xs text-muted-foreground">EST_GAS</div>
                    <div className="font-bold">~0.02 ETH</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full border corner-accents flex hover:bg-accent hover:text-white cursor-pointer transition-colors items-center justify-center gap-2 px-4 py-3 bg-accent/5">
                  <span className="text-sm font-bold">[DEPLOY_CONTRACT]</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button className="w-full border corner-accents flex hover:bg-muted/30 cursor-pointer transition-colors items-center justify-center gap-2 px-4 py-2">
                  <span className="text-sm font-bold">[PREVIEW]</span>
                </button>
              </div>

              <div className="border corner-accents p-4 bg-muted/5 space-y-2">
                <div className="text-xs font-bold">[INFO]</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>&gt; TICKETS_ARE_ERC721</p>
                  <p>&gt; IMMUTABLE_ON_CHAIN</p>
                  <p>&gt; YOU_KEEP_100%_SALES</p>
                  <p>&gt; INSTANT_SETTLEMENT</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="border border-t-0 corner-accents">
          <div className="p-6 md:p-8 border-b">
            <h2 className="text-2xl font-bold tracking-tight">
              [BEST_PRACTICES]
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-y md:divide-y-0">
            <div className="p-6 hover:bg-muted/30 transition-colors">
              <div className="space-y-2">
                <div className="text-sm font-bold text-accent">
                  [01] HIGH_QUALITY_IMAGE
                </div>
                <p className="text-xs text-muted-foreground">
                  Use clear, high-resolution images. This becomes the NFT
                  artwork and primary visual for your event.
                </p>
              </div>
            </div>
            <div className="p-6 hover:bg-muted/30 transition-colors">
              <div className="space-y-2">
                <div className="text-sm font-bold text-accent">
                  [02] CLEAR_DESCRIPTION
                </div>
                <p className="text-xs text-muted-foreground">
                  Include all important details. What, when, where, and what
                  attendees can expect from your event.
                </p>
              </div>
            </div>
            <div className="p-6 hover:bg-muted/30 transition-colors">
              <div className="space-y-2">
                <div className="text-sm font-bold text-accent">
                  [03] FAIR_PRICING
                </div>
                <p className="text-xs text-muted-foreground">
                  Set reasonable royalties (2-10%) to earn from resales while
                  keeping tickets attractive to buyers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
