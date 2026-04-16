import ReactPDF from "@react-pdf/renderer";
const { Document, Page, Text, View, StyleSheet, pdf } = ReactPDF;
import { writeFileSync } from "fs";
import React from "react";

const GREEN = "#0e4f51";
const GOLD = "#c8aa4a";
const LIGHT = "#F9F8F5";

const styles = StyleSheet.create({
  page: { padding: 50, fontFamily: "Helvetica", backgroundColor: "#FFFFFF", fontSize: 9 },
  coverPage: { padding: 50, fontFamily: "Helvetica", backgroundColor: GREEN, justifyContent: "center", alignItems: "center", height: "100%" },
  coverPre: { fontSize: 9, letterSpacing: 3, color: GOLD, textTransform: "uppercase", marginBottom: 12 },
  coverTitle: { fontSize: 32, fontFamily: "Helvetica-Bold", color: "#FFFFFF", marginBottom: 8, textAlign: "center" },
  coverSubtitle: { fontSize: 14, color: "#FFFFFF", opacity: 0.7, marginBottom: 4, textAlign: "center" },
  coverDate: { fontSize: 11, color: GOLD, marginTop: 20, textAlign: "center" },
  coverFooter: { position: "absolute", bottom: 50, left: 50, right: 50, textAlign: "center" },
  coverFooterText: { fontSize: 8, color: "#FFFFFF", opacity: 0.5 },
  sectionLabel: { fontSize: 8, letterSpacing: 3, color: GOLD, textTransform: "uppercase", marginBottom: 8 },
  h2: { fontSize: 16, fontFamily: "Helvetica-Bold", color: GREEN, marginBottom: 12 },
  h3: { fontSize: 12, fontFamily: "Helvetica-Bold", color: GREEN, marginBottom: 6, marginTop: 16 },
  body: { fontSize: 9, color: "#333333", lineHeight: 1.6, marginBottom: 8 },
  postBox: { backgroundColor: LIGHT, borderRadius: 4, padding: 12, marginBottom: 10 },
  postLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: GOLD, marginBottom: 4 },
  postCaption: { fontSize: 8.5, color: "#333333", lineHeight: 1.5 },
  storySlide: { flexDirection: "row", marginBottom: 4 },
  storyNum: { fontSize: 8, fontFamily: "Helvetica-Bold", color: GREEN, width: 50 },
  storyText: { fontSize: 8, color: "#555555", flex: 1, lineHeight: 1.4 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#E5E5E5", marginVertical: 16 },
  scheduleRow: { flexDirection: "row", paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: "#EEEEEE" },
  scheduleDate: { width: 60, fontSize: 8, fontFamily: "Helvetica-Bold", color: GREEN },
  scheduleCell: { flex: 1, fontSize: 7.5, color: "#555555" },
  scheduleHeader: { flexDirection: "row", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: GREEN },
  scheduleHeaderText: { flex: 1, fontSize: 7, fontFamily: "Helvetica-Bold", color: GOLD, textTransform: "uppercase", letterSpacing: 1 },
  note: { fontSize: 8, color: "#888888", fontStyle: "italic", marginTop: 8 },
  pageNum: { position: "absolute", bottom: 30, right: 50, fontSize: 7, color: "#CCCCCC" },
});

function PostBox({ label, text }) {
  return React.createElement(View, { style: styles.postBox },
    React.createElement(Text, { style: styles.postLabel }, label),
    React.createElement(Text, { style: styles.postCaption }, text)
  );
}

function StorySlide({ num, text }) {
  return React.createElement(View, { style: styles.storySlide },
    React.createElement(Text, { style: styles.storyNum }, `Slide ${num}:`),
    React.createElement(Text, { style: styles.storyText }, text)
  );
}

const LINKEDIN_POSTS = [
  {
    id: "HL1 — Mon 13 Apr",
    text: `Most athlete brand deals start in a boardroom.\n\nThe best ones start somewhere else entirely.\n\nA terrace during qualifying. A yacht deck at sunset. A conversation that nobody planned but everybody remembers.\n\nThis is why we created The Pavilion at the Monaco Grand Prix. A private weekend for athletes, entrepreneurs, and the brands that connect them. No panels. No keynotes. Just three days in a room where the people on both sides of every deal are standing next to each other.\n\nWe are putting international rugby legends alongside founders, fund managers, and brand partners. The media booth is running all weekend for podcasts and interviews.\n\nIf you work in sports business, athlete management, or brand partnerships, this is the room you want to be in.\n\n5-8 June. Monaco.`
  },
  {
    id: "HL2 — Thu 16 Apr",
    text: `I have spent 15 years in sports media. The pattern is always the same.\n\nThe athlete wants to build a brand. The brand wants access to the athlete. The agent sits in the middle trying to make the numbers work.\n\nWhat if you put all three in the same room for three days? Not in a meeting. On a yacht. During the Monaco Grand Prix. With cocktails that are stirred, not shaken, and a media booth where the conversations become content.\n\nThat is The Pavilion.\n\nInternational rugby legends. Entrepreneurs who run property portfolios, venture funds, and sports businesses. Brands looking for authentic partnerships, not logo placements.\n\nA few spots remain on both sides. Athletes and brands.`
  },
  {
    id: "HL3 — Mon 20 Apr",
    text: `The sports business industry talks a lot about "athlete empowerment."\n\nHere is what that actually looks like:\n\nAn athlete sits on a yacht deck with a venture capitalist who has backed three sports tech companies. They are watching the Monaco Grand Prix. Between them is a fund manager whose family office invests in athlete-founded businesses.\n\nNobody is pitching. Nobody is selling. They are just in the same room because someone curated a guest list properly.\n\nThis is The Pavilion. 100 guests. Three days. A media booth. And the kind of connections that do not happen at conferences.\n\nAthletes and brands: a few spots remain.`
  },
  {
    id: "HL4 — Thu 23 Apr",
    text: `Sponsorship at The Pavilion is not a logo on a banner.\n\nIt is your brand embedded in a three-day experience with 100 people who are decision-makers in real estate, sports business, wealth management, venture, and alternative assets. Plus international athletes with combined social followings in the millions.\n\nCocktail dinatoire every evening with your brand at the centre. A media booth producing content all weekend. Hospitality on a superyacht and VIP terraces.\n\nFour sponsorship tiers. The right one depends on how deep you want to go.`
  },
  {
    id: "HL5 — Mon 27 Apr",
    text: `May 1st is our internal checkpoint for The Pavilion.\n\nBy then, we need to know who is in the room. Athletes, guests, sponsors.\n\nWhat I can tell you: the athlete roster includes international rugby legends with combined social followings that would make most brand managers stop scrolling. The guest list includes founders, fund managers, and operators across six industries. The media booth is confirmed and we already have more interview requests than time slots.\n\nIf you are an athlete looking for brand opportunities in a room full of decision-makers, or a brand looking for authentic athlete access, this is the window.\n\nDM me or email hamish@hamemedia.com`
  },
  {
    id: "HL6 — Wed 30 Apr",
    text: `Last day before our May 1st checkpoint.\n\nThe Pavilion has shaped up into something I am genuinely proud of. The athlete talent, the guest list, the format.\n\nIf you work in sports business, talent management, or brand partnerships and have been watching from the sidelines, today is the day. Tomorrow the roster locks.\n\nMonaco Grand Prix. June 5-8. 100 people on a yacht and VIP terraces.\n\nhamish@hamemedia.com`
  },
];

const IG_POSTS = [
  {
    id: "HI1 — Mon 13 (Feed)",
    text: `Three days. One yacht. International athletes. Entrepreneurs. Brands.\n\nThe Pavilion is not a corporate box. It is a private weekend during the Monaco Grand Prix where athletes and business meet without the boardroom.\n\nMedia booth running all weekend. Podcasts. Interviews. Content that money cannot script.\n\nJune 5-8. Monaco. By invitation.\n\n#MonacoGP #SportsBusiness #ThePavilion`
  },
  {
    id: "HI2 — Wed 15 (Feed)",
    text: `The athletes coming to The Pavilion are not coming for a free trip.\n\nThey are coming because the entrepreneurs in the room are the ones building the businesses they want to invest in, partner with, or back.\n\nWhen an international rugby legend sits next to a venture capitalist during qualifying, that is not networking. That is just Saturday.\n\nJune 5-8. Monaco GP. DM for details.`
  },
  {
    id: "HI3 — Sat 18 (Feed)",
    text: `We are putting a media booth on a 47m yacht during the Monaco Grand Prix.\n\nPodcasts. Interviews. Some about business. Some about why Verstappen is overrated. Some about both.\n\nThe best sports content does not come from a studio. It comes from a deck at sunset after qualifying, when everyone has a drink in hand and nothing to prove.\n\nThe Pavilion. June 5-8.`
  },
  {
    id: "HI4 — Mon 20 (Feed)",
    text: `What happens when you put athletes and entrepreneurs on the same yacht for three days?\n\nBrand deals that start as banter. Investment conversations that start as arguments about the best qualifying lap. Content that cannot be produced in a studio.\n\nThe Pavilion. Monaco GP. June 5-8.\n\nStill a few seats. Athletes, brands, and entrepreneurs.\n\nDM for details.`
  },
  {
    id: "HI5 — Wed 22 (Feed)",
    text: `The Pavilion sponsorship is not a logo.\n\nIt is three evenings of cocktail dinatoire on a yacht with your brand at the centre. A media booth producing interviews and podcasts. 100 guests from six industries. Athletes who are also business owners. Entrepreneurs who are also sports fans.\n\nIf your brand wants to be in this room, not just on a banner outside it: link in bio.`
  },
  {
    id: "HI6 — Fri 24 (Feed)",
    text: `Saturday evening. Qualifying is done. The yacht is lit. An athlete and a fund manager are arguing about whether property or sports tech is the better investment.\n\nNeither will win the argument. Both will exchange numbers.\n\nThis is not a hospitality package. It is a private weekend where business happens because the right people are in the same room.\n\nThe Pavilion. Monaco. June.`
  },
  {
    id: "HI7 — Mon 27 (Feed)",
    text: `5 weeks. The roster is nearly set.\n\nAthletes. Entrepreneurs. Brands. Three days on a yacht and VIP terraces during the Monaco Grand Prix.\n\nThe media booth is ready. The cocktails are being selected (stirred only). The conversations have not started yet, but the guest list says they will be worth having.\n\nFinal spots. Athletes and brands.\n\nDM or link in bio.`
  },
  {
    id: "HI8 — Wed 30 (Feed)",
    text: `Tomorrow is May 1st.\n\nThe guest list locks. The athlete roster finalises. The sponsors are confirmed.\n\nIf you have been thinking about The Pavilion, this is the last call.\n\n100 guests. Monaco GP. June 5-8. Cocktail dinatoire. Media booth. International athletes. Entrepreneurs and investors.\n\nDM me: hamish@hamemedia.com`
  },
];

const IG_STORIES = [
  { id: "HIG-S1 — Tue 14", slides: ["Athlete training clip or highlight reel. Text: \"They're coming.\"", "\"International rugby legends. Entrepreneurs. One yacht.\"", "\"The Pavilion. Monaco GP. June.\""] },
  { id: "HIG-S2 — Thu 16", slides: ["Question sticker: \"Best athlete brand deal you have seen?\"", "\"The best ones start with a conversation, not a contract.\"", "\"We are building a room where those conversations happen. Monaco GP. June.\""] },
  { id: "HIG-S3 — Sat 18", slides: ["Podcast mic close-up. Text: \"The Media Booth.\"", "\"On a yacht. During Monaco GP. Athletes. Founders. Brands.\"", "\"If you want in: DM.\""] },
  { id: "HIG-S4 — Tue 21", slides: ["Athlete highlight reel / training montage. Text: \"The roster is building.\"", "\"International legends. Current internationals. Business athletes.\"", "\"If you should be on this list, DM me.\""] },
  { id: "HIG-S5 — Thu 23", slides: ["Sponsorship page screenshot. Text: \"Platinum. Gold. Bronze.\"", "\"Not a logo on a wall. Your brand at the centre of the weekend.\"", "Poll: \"What matters more for a brand deal?\" Options: \"Reach\" / \"The right room\""] },
  { id: "HIG-S6 — Sat 25", slides: ["Behind-the-scenes planning. Text: \"5 weeks out.\"", "\"Guest list. Athlete roster. Sponsorship. Media booth. Cocktails.\"", "\"Coming together. DM for the last spots.\""] },
  { id: "HIG-S7 — Tue 28", slides: ["Countdown sticker to June 5. Text: \"The roster is nearly final.\"", "\"Athletes. Brands. Entrepreneurs. Last window.\"", "\"DM me if you should be in this room.\""] },
  { id: "HIG-S8 — Wed 30", slides: ["Text on dark background: \"May 1st. Tomorrow.\"", "\"Yacht confirmed. Terraces confirmed. Athletes confirmed. Cocktails stirred.\"", "\"Final call. hamish@hamemedia.com\""] },
];

const SCHEDULE = [
  { date: "Mon 13", linkedin: "HL1", igFeed: "HI1", igStory: "" },
  { date: "Tue 14", linkedin: "", igFeed: "", igStory: "HIG-S1" },
  { date: "Wed 15", linkedin: "", igFeed: "HI2", igStory: "" },
  { date: "Thu 16", linkedin: "HL2", igFeed: "", igStory: "HIG-S2" },
  { date: "Sat 18", linkedin: "", igFeed: "HI3", igStory: "HIG-S3" },
  { date: "Mon 20", linkedin: "HL3", igFeed: "HI4", igStory: "" },
  { date: "Tue 21", linkedin: "", igFeed: "", igStory: "HIG-S4" },
  { date: "Wed 22", linkedin: "", igFeed: "HI5", igStory: "" },
  { date: "Thu 23", linkedin: "HL4", igFeed: "", igStory: "HIG-S5" },
  { date: "Fri 24", linkedin: "", igFeed: "HI6", igStory: "" },
  { date: "Sat 25", linkedin: "", igFeed: "", igStory: "HIG-S6" },
  { date: "Mon 27", linkedin: "HL5", igFeed: "HI7", igStory: "HIG-S7" },
  { date: "Wed 30", linkedin: "HL6", igFeed: "HI8", igStory: "HIG-S8" },
];

function GOMContentPDF() {
  return React.createElement(Document, null,
    // Cover
    React.createElement(Page, { size: "A4", style: styles.coverPage },
      React.createElement(Text, { style: styles.coverPre }, "GAME ON MEDIA"),
      React.createElement(Text, { style: styles.coverTitle }, "The Pavilion"),
      React.createElement(Text, { style: styles.coverSubtitle }, "Social Media Content Plan"),
      React.createElement(Text, { style: styles.coverSubtitle }, "Monaco Grand Prix 2026"),
      React.createElement(Text, { style: styles.coverDate }, "April 13 - 30, 2026"),
      React.createElement(View, { style: styles.coverFooter },
        React.createElement(Text, { style: styles.coverFooterText }, "CONFIDENTIAL  |  The Gatekeepers Club x Game ON Media"),
      ),
    ),

    // Overview page
    React.createElement(Page, { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.sectionLabel }, "OVERVIEW"),
      React.createElement(Text, { style: styles.h2 }, "Your Content Plan"),
      React.createElement(Text, { style: styles.body }, "Hamish, I have put together 22 pieces of ready-to-post content for your channels across the 18 days leading to our May 1st checkpoint. The goal: fill remaining athlete spots, close sponsorship, and make every athlete and brand in your network feel that The Pavilion is where they need to be. All copy is ready to go. Adapt the tone to your voice, but the structure and cadence are locked."),
      React.createElement(View, { style: styles.divider }),
      React.createElement(Text, { style: styles.h3 }, "Your Voice"),
      React.createElement(Text, { style: styles.body }, "You are the sports media insider. You know the athletes, the agents, the brands. Your content should make people feel the deal flow is already happening and The Pavilion is where the action is. Athletes should read your posts and want to be invited. Brands should read them and reach for their wallets. I will be running TGC content in parallel on LinkedIn, X, Substack Notes and IG Stories. We should cross-comment on each other's posts (not reshare, comment) to create the sense of two partners building something together."),
      React.createElement(Text, { style: styles.h3 }, "Channels & Volume"),
      React.createElement(Text, { style: styles.body }, "LinkedIn: 6 posts (professional, sports business, talent access)\nInstagram Feed: 8 posts (visual, lifestyle, athlete-meets-business)\nInstagram Stories: 8 sets of 3 slides each (teasers, polls, countdowns)\n\nTotal: 22 pieces across 18 days."),
      React.createElement(Text, { style: styles.h3 }, "Three-Week Arc"),
      React.createElement(Text, { style: styles.body }, "Week 1 (Apr 13-19) \"The Talent Is Coming\" — Athletes and brands are circling.\nWeek 2 (Apr 20-26) \"The Deal Flow\" — Sports meets capital. Brand deals, content.\nWeek 3 (Apr 27-30) \"Final Window\" — Roster nearly set. Last chance."),
      React.createElement(Text, { style: styles.h3 }, "Engagement Rule"),
      React.createElement(Text, { style: styles.body }, "Reply to every comment within 4 hours. DM anyone who engages: \"Thanks. Happy to share more details if useful.\" If an athlete likes or comments, treat as a warm lead."),
      React.createElement(Text, { style: styles.h3 }, "Tracking Links"),
      React.createElement(Text, { style: { ...styles.body, fontSize: 7.5 } }, "Event: portal.thegatekeepers.club/event/the-pavilion?utm_source=[instagram or linkedin]&utm_medium=social&utm_campaign=gom-april\nSponsorship: portal.thegatekeepers.club/event/the-pavilion/sponsorship?utm_source=[instagram or linkedin]&utm_medium=social&utm_campaign=gom-sponsor-april"),
      React.createElement(Text, { style: styles.pageNum }, "2"),
    ),

    // Schedule page
    React.createElement(Page, { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.sectionLabel }, "SCHEDULE"),
      React.createElement(Text, { style: styles.h2 }, "Posting Calendar"),
      React.createElement(View, { style: styles.scheduleHeader },
        React.createElement(Text, { style: { ...styles.scheduleHeaderText, width: 60, flex: undefined } }, "DATE"),
        React.createElement(Text, { style: styles.scheduleHeaderText }, "LINKEDIN"),
        React.createElement(Text, { style: styles.scheduleHeaderText }, "IG FEED"),
        React.createElement(Text, { style: styles.scheduleHeaderText }, "IG STORIES"),
      ),
      ...SCHEDULE.map((row, i) =>
        React.createElement(View, { key: i, style: styles.scheduleRow },
          React.createElement(Text, { style: styles.scheduleDate }, row.date),
          React.createElement(Text, { style: styles.scheduleCell }, row.linkedin || "-"),
          React.createElement(Text, { style: styles.scheduleCell }, row.igFeed || "-"),
          React.createElement(Text, { style: styles.scheduleCell }, row.igStory || "-"),
        )
      ),
      React.createElement(View, { style: styles.divider }),
      React.createElement(Text, { style: styles.note }, "Totals: 6 LinkedIn + 8 Instagram Feed + 8 Instagram Story sets = 22 pieces"),
      React.createElement(Text, { style: styles.pageNum }, "3"),
    ),

    // LinkedIn posts (2 per page to avoid overflow)
    React.createElement(Page, { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.sectionLabel }, "LINKEDIN"),
      React.createElement(Text, { style: styles.h2 }, "LinkedIn Posts (6)"),
      ...LINKEDIN_POSTS.slice(0, 2).map((post, i) =>
        React.createElement(View, { key: i }, PostBox({ label: post.id, text: post.text }))
      ),
      React.createElement(Text, { style: styles.pageNum }, "4"),
    ),
    React.createElement(Page, { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.sectionLabel }, "LINKEDIN (CONTINUED)"),
      ...LINKEDIN_POSTS.slice(2, 4).map((post, i) =>
        React.createElement(View, { key: i }, PostBox({ label: post.id, text: post.text }))
      ),
      React.createElement(Text, { style: styles.pageNum }, "5"),
    ),
    React.createElement(Page, { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.sectionLabel }, "LINKEDIN (CONTINUED)"),
      ...LINKEDIN_POSTS.slice(4).map((post, i) =>
        React.createElement(View, { key: i }, PostBox({ label: post.id, text: post.text }))
      ),
      React.createElement(Text, { style: styles.pageNum }, "6"),
    ),

    // Instagram Feed posts (2-3 per page)
    React.createElement(Page, { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.sectionLabel }, "INSTAGRAM FEED"),
      React.createElement(Text, { style: styles.h2 }, "Instagram Feed Posts (8)"),
      ...IG_POSTS.slice(0, 2).map((post, i) =>
        React.createElement(View, { key: i }, PostBox({ label: post.id, text: post.text }))
      ),
      React.createElement(Text, { style: styles.pageNum }, "7"),
    ),
    React.createElement(Page, { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.sectionLabel }, "INSTAGRAM FEED (CONTINUED)"),
      ...IG_POSTS.slice(2, 5).map((post, i) =>
        React.createElement(View, { key: i }, PostBox({ label: post.id, text: post.text }))
      ),
      React.createElement(Text, { style: styles.pageNum }, "8"),
    ),
    React.createElement(Page, { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.sectionLabel }, "INSTAGRAM FEED (CONTINUED)"),
      ...IG_POSTS.slice(5).map((post, i) =>
        React.createElement(View, { key: i }, PostBox({ label: post.id, text: post.text }))
      ),
      React.createElement(Text, { style: styles.pageNum }, "9"),
    ),

    // Instagram Stories
    React.createElement(Page, { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.sectionLabel }, "INSTAGRAM STORIES"),
      React.createElement(Text, { style: styles.h2 }, "Instagram Story Sets (8)"),
      ...IG_STORIES.map((story, i) =>
        React.createElement(View, { key: i, style: { marginBottom: 12 } },
          React.createElement(Text, { style: styles.postLabel }, story.id),
          ...story.slides.map((slide, j) =>
            StorySlide({ num: j + 1, text: slide })
          ),
        )
      ),
      React.createElement(Text, { style: styles.pageNum }, "10"),
    ),

    // Rules page
    React.createElement(Page, { size: "A4", style: styles.page },
      React.createElement(Text, { style: styles.sectionLabel }, "GUIDELINES"),
      React.createElement(Text, { style: styles.h2 }, "Content Rules"),
      React.createElement(Text, { style: styles.h3 }, "Never Use"),
      React.createElement(Text, { style: styles.body }, "\"exclusive\", \"luxury\", \"world-class\", \"unique\", \"don't miss out\", \"limited time\", \"once in a lifetime\""),
      React.createElement(Text, { style: styles.h3 }, "Always Use"),
      React.createElement(Text, { style: styles.body }, "Specific numbers (100 guests, 80 yacht, 20 terrace). Specific industries. Specific format details (cocktail dinatoire, stirred not shaken, media booth)."),
      React.createElement(Text, { style: styles.h3 }, "Images"),
      React.createElement(Text, { style: styles.body }, "Monaco harbour, yacht decks, terrace views, cocktail prep, microphones, behind-the-scenes of planning. Never stock photos of people in suits shaking hands."),
      React.createElement(Text, { style: styles.h3 }, "Cross-Promotion"),
      React.createElement(Text, { style: styles.body }, "Comment on Christian's TGC posts (do not reshare). This creates the sense of two partners building something together."),
      React.createElement(Text, { style: styles.h3 }, "Leads"),
      React.createElement(Text, { style: styles.body }, "Athletes who engage: warm lead. Follow up immediately via DM.\nBrands who engage: DM to kickstart a sponsorship conversation.\nReply to every comment within 4 hours."),
      React.createElement(View, { style: styles.divider }),
      React.createElement(Text, { style: { ...styles.body, textAlign: "center", marginTop: 20 } }, "The Gatekeepers Club x Game ON Media\nThe Pavilion, Monaco Grand Prix 2026\n\nhamish@hamemedia.com  |  christian@thegatekeepers.club"),
      React.createElement(Text, { style: styles.pageNum }, "12"),
    ),
  );
}

async function generate() {
  const pdfInstance = pdf(React.createElement(GOMContentPDF));
  const blob = await pdfInstance.toBlob();
  const buffer = Buffer.from(await blob.arrayBuffer());
  const outputPath = "/home/christian/Documents/The Gatekeepers Club/06_PROJECTS/Monaco_GP_2026_Pavilion/GOM_Social_Content_Plan_April_2026.pdf";
  writeFileSync(outputPath, buffer);
  console.log(`PDF generated: ${outputPath}`);
}

generate().catch(console.error);
