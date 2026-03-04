// ─── DEMO SPEC ────────────────────────────────────────────────────────────────
// Generic slot game feature spec — safe for public demo
// No real studio, game, or internal system names used

export const DEMO_SPEC = `Feature: Player Level Up Flow — UX Redesign
Game Type: Mobile Slot Game (iOS & Android)

OVERVIEW:
Redesigning the level up experience to remove friction and improve player retention.
Replacing old blocking dialogs (which interrupted autospin and required manual dismiss)
with a lightweight, non-interrupting toaster notification system.

CHANGES:
1. New level up toaster — top of screen, coin reward animation, sparkle effect, 2s auto-dismiss
2. New max bet toaster — positioned near bet selector (bottom area), pulsing glow on bet button, 5s duration
3. Reward comms redesign — removing 2 old blocking dialogs that stopped autospin, replacing with passive toasters
4. New reward factor toaster — appears below purchase CTA, slide-up animation, 3s duration
5. Return-to-lobby (RTL) dialog — shown on lobby return when bonus reward was earned in session
6. Machine unlock toaster — top format, non-interactable, coin reward animation + sparkle
7. All toasters compatible with portrait (vertical) machine layouts

NOTIFICATION PRIORITY ORDER:
P0: Level up (default state)
P1: Machine unlock (batch and single)
P2: Level milestone reward
P3: Reward factor adjustment
P4: Max bet increase
Rule: Maximum 3 notification elements shown simultaneously.
Rule: CRM shelf notifications delayed until level up toaster completes.

QUEUE BEHAVIOUR:
- Notifications display sequentially, never simultaneously
- If showing when player enters bonus game or big win: mark as viewed, do not reshown on return
- If queued (not yet shown) when screen changes: show on return to machine
- Back-to-back level ups: cancel current queue, start new level queue immediately
- Multiple reward factor changes before lobby return: show only the most recent RTL dialog

CONFIG VARIABLES (Remote Config / Feature Flags):
- notif_toggle_level_up (Boolean, default: true)
- notif_duration_level_up (Integer, default: 2s)
- notif_min_level_level_up (Integer, default: 1)
- notif_max_level_level_up (Integer, default: 999)
- notif_toggle_max_bet (Boolean, default: true)
- notif_duration_max_bet (Integer, default: 5s)
- notif_toggle_reward_factor (Boolean, default: true)
- notif_duration_reward_factor (Integer, default: 3s)
- rtl_dialog_toggle (Boolean, default: true)
- rtl_dialog_min_level (Integer, default: 50)

EDGE CASES DOCUMENTED:
- Back-to-back level ups within a single session
- Toaster visible when bonus game / free spins triggered
- Toaster queued when player navigates away mid-session
- Multiple reward factor changes before returning to lobby
- CRM shelf notification conflict with level up toaster
- Player at maximum level — no further level up toasters
- Config flags disabled mid-session via remote update
- App force-closed while toaster is displaying
- Poor network / offline at time of level up
- Min/max level boundary values for each config variable

ASSETS:
- Level up toaster component (updated)
- Max bet toaster component (new)
- Reward factor toaster component (new — copy/wording TBD)
- Coin reward animation (updated)
- Sparkle particle effect (updated)
- RTL reward dialog (new)

REMOVING:
- Old "Level Challenge" blocking pre-reward dialog (interrupted autospin, required manual dismiss)
- Old "Congratulations" blocking post-reward dialog (interrupted autospin, did not auto-close)
- Machine unlock info and max bet info from level up toaster (moved to separate toasters)

PLATFORMS: iOS 15+, Android 9+, Web (responsive)`;

// ─── MOCK ANALYSIS ────────────────────────────────────────────────────────────
export const MOCK_ANALYSIS = {
  featureSummary: "Redesign of the player level up flow UX — replacing two blocking autospin-interrupting dialogs with a non-interrupting toaster notification system, introducing contextual max bet and reward factor comms, and streamlining the coin reward animation.",
  detectedFeatures: [
    "Level up toaster notification (updated visuals, new position)",
    "Max bet increase toaster (new, anchored to bet selector)",
    "Reward factor toaster (new, non-interrupting)",
    "Return-to-lobby (RTL) reward dialog",
    "Machine unlock toaster (non-interactable)",
    "Coin reward animation (updated)",
    "Notification queue and priority system (P0–P4)",
    "Remote config / feature flag variables (10 variables)",
    "Back-to-back level up queue replacement logic",
    "CRM shelf notification conflict resolution"
  ],
  detectedAssets: [
    "Level up toaster UI component",
    "Max bet toaster UI component",
    "Reward factor toaster UI component",
    "Coin reward particle animation",
    "Sparkle particle effect",
    "RTL reward dialog",
    "Pulsing glow on bet selector button"
  ],
  hasAnimations: true,
  hasSoundDesign: true,
  hasNetworkDependency: true,
  hasEOSConfig: true,
  platforms: ["iOS", "Android", "Web"],
  suggestedTestTypes: [
    { type: "Functional Tests",               reason: "Core toaster trigger, content, queue, and dismiss flows for all 3 new toasters", estimatedCases: 14 },
    { type: "Negative Tests",                 reason: "Removed dialogs must NOT appear; autospin must NOT be interrupted; wrong positions must NOT occur", estimatedCases: 11 },
    { type: "Spam & Stress Tests",            reason: "Back-to-back level ups at high bet, rapid queue replacement, race conditions under speed", estimatedCases: 7 },
    { type: "UI & Art Tests",                 reason: "Toaster visuals, positions, coin animation, pulsing glow, portrait layout compatibility", estimatedCases: 10 },
    { type: "Audio Tests",                    reason: "Level up SFX — correct track, no double-play, no cutoff, correct duration per toaster", estimatedCases: 4 },
    { type: "Queue & Priority Tests",         reason: "P0–P4 ordering enforced, max 3 elements cap, sequential not simultaneous, CRM delay respected", estimatedCases: 12 },
    { type: "Config / Feature Flag Tests",    reason: "10 remote config variables — each tested independently for toggle, duration, and level boundary", estimatedCases: 13 },
    { type: "Edge Case & Interruption Tests", reason: "Bonus game during toaster, app kill, network drop, multiple reward factors before lobby return", estimatedCases: 10 },
    { type: "Regression Tests",               reason: "Autospin no longer interrupted, old dialogs fully removed, bet selector functions during toaster", estimatedCases: 8 },
    { type: "Portrait Machine Tests",         reason: "All 3 toasters and RTL dialog must render correctly in portrait (vertical) machine orientation", estimatedCases: 6 },
  ],
  clarifyingQuestions: [
    "What is the final copy / wording for the reward factor toaster? (spec marks this as TBD)",
    "Can the RTL reward dialog be manually dismissed by the player, or is it auto-close only?",
    "Is there a new sound asset for the level up toaster, or does existing SFX carry over unchanged?",
    "On web platform — are toaster dimensions and positions responsive or fixed pixel values?",
    "What is the maximum number of levels a player can gain in a single coin purchase?",
    "Is there a loading or transitional state if remote config fetch is slow at the moment of level up?",
    "Does the machine unlock toaster coin animation differ from the level up toaster coin animation?",
  ],
  riskAreas: [
    "Notification queue logic — often legacy code, high complexity, fragile under rapid events",
    "Back-to-back level up queue cancellation and replacement mid-sequence",
    "CRM shelf notification + level up toaster display race condition",
    "Remote config min/max level boundary off-by-one errors",
    "RTL dialog suppression logic when machine unlock is also eligible simultaneously",
    "Portrait machine layout rendering for all 3 new toasters",
    "Bonus game interruption — viewed vs queued state distinction at exact transition moment"
  ]
};

// ─── MOCK TEST CASES ──────────────────────────────────────────────────────────
export const MOCK_TEST_CASES = [
  {
    folder: "Functional Tests", id: "TC_001", priority: "P1", type: "Functional", testingMode: "Manual",
    name: "Level Up Toaster — Trigger, Content Accuracy and Auto-Dismiss",
    description: "Validates that the level up toaster appears with the correct new level number, correct coin reward amount, correct XP grant, and auto-dismisses after the configured duration (default 2s). Verifies the coin animation plays during display and the toaster is positioned at the top of screen without obscuring the reel area.",
    precondition: "Test device (iOS or Android), latest test build, remote config test variant active (notif_toggle_level_up=true, notif_duration_level_up=2), account at a known level near threshold, sufficient balance to trigger level up within 3 spins, stable Wi-Fi",
    steps: [
      "1. Launch the game on the test device",
      "2. Dismiss any MOTD, daily bonus, or promotional overlays",
      "3. Wait for the main game screen to fully load — spin button active, all assets visible",
      "4. Confirm the account is at the target pre-level-up level",
      "5. Set bet to minimum amount that triggers level up within 1–3 spins",
      "6. Spin until the level transition occurs",
      "7. Observe the toaster: appearance, content, position, animation, and dismiss timing"
    ],
    expectedResult: "Level up toaster appears at the top of the screen. Content shows the correct new level number, correct coin reward, and correct XP grant. Coin reward animation plays while toaster is visible. Toaster auto-dismisses after 2 seconds without player interaction. Spin gameplay continues uninterrupted. XP progress bar updates to reflect the new level.",
    negativeScenario: "An old blocking dialog appears instead of the toaster. Toaster overlaps or obscures the reel area. Autospin pauses or stops when toaster appears. Wrong level number shown in toaster. Toaster does not auto-dismiss. Toaster appears off-position.",
    linkedBugRisk: "Level up flow routing to old blocking dialog code path; autospin interrupt hook not removed; wrong level value passed to toaster component"
  },
  {
    folder: "Negative Tests", id: "TC_012", priority: "P1", type: "Negative", testingMode: "Manual",
    name: "Removed Blocking Dialogs — Must Not Appear Anywhere in Updated Flow",
    description: "Regression verification that both removed dialogs (pre-reward 'Level Challenge' blocking modal and post-reward 'Congratulations' blocking modal) are fully absent from the level up flow. These previously stopped autospin and required manual dismissal. Validates their complete absence at every level range where they previously triggered.",
    precondition: "Test build with old dialog code removed, remote config test variant active, autospin running at time of level up, account at the level range where blocking dialogs previously appeared",
    steps: [
      "1. Launch the game on the test device",
      "2. Dismiss any MOTD or promotional overlays",
      "3. Enable autospin at a standard bet size",
      "4. Let autospin run continuously through a level up transition",
      "5. Observe the entire level up sequence — note every element that appears on screen",
      "6. Continue autoplay for 30 seconds after level up — verify nothing further appears",
      "7. Repeat across multiple level ranges where old dialogs previously triggered"
    ],
    expectedResult: "No blocking modal or dialog appears at any point before, during, or after the level up. Autospin continues without pause throughout. New toaster notification appears instead (non-blocking). Player is never required to tap or dismiss anything.",
    negativeScenario: "A modal with an OK or Continue button appears, halting autospin. Player must tap to dismiss before gameplay resumes. A full-screen overlay appears after the level up. Any element requiring player interaction fires during the autospin sequence.",
    linkedBugRisk: "Old dialog code path not fully decommissioned; conditional still routing to legacy flow for specific level ranges or config states"
  },
  {
    folder: "Queue & Priority Tests", id: "TC_023", priority: "P1", type: "Queue", testingMode: "Manual",
    name: "Back-to-Back Level Up — Current Queue Cancelled, New Queue Replaces Immediately",
    description: "When a player levels up a second time before the first level's notification queue has completed, the spec requires the current queue to stop immediately and the new level's queue to start from the beginning. Validates that no stale toasters from the previous queue appear after the replacement.",
    precondition: "Account near a level where two consecutive level ups can be triggered in quick succession, large coin balance or max bet available, notif_duration_level_up=2 (default), all notification toggles enabled in remote config",
    steps: [
      "1. Launch the game, dismiss all overlays",
      "2. Position the account 1 spin away from a level up",
      "3. Trigger the first level up — the level up toaster (P0) begins displaying",
      "4. While the first toaster is still on screen, immediately trigger a second level up via coin purchase or max bet spin",
      "5. Observe what happens to the first notification queue",
      "6. Observe when and how the second level's notifications begin"
    ],
    expectedResult: "The first level's notification queue stops the moment the second level up is detected. No further toasters from the first level's P1–P4 queue appear. The second level's queue starts from P0 with the new level's correct values. No simultaneous toasters appear at any point.",
    negativeScenario: "Both queues run at the same time showing duplicate toasters. The first queue completes fully before the second starts. Stale reward values from the first level appear in a toaster after the second level up. Max bet toaster fires twice with conflicting amounts.",
    linkedBugRisk: "Notification queue object not cleared on new level event; event listener holding reference to previous queue state"
  },
  {
    folder: "Config / Feature Flag Tests", id: "TC_031", priority: "P1", type: "EOS", testingMode: "Manual",
    name: "notif_toggle_level_up = false — Level Up Toaster Fully Suppressed",
    description: "When the remote config toggle for the level up toaster is set to false, the toaster must not appear under any circumstance. Verifies that other toasters in the queue (max bet, reward factor) still behave correctly when the P0 element is suppressed.",
    precondition: "Remote config override: notif_toggle_level_up=false (all others true), test variant active, account at a level where level up is imminent within 1–2 spins",
    steps: [
      "1. Launch the game with remote config override: notif_toggle_level_up=false",
      "2. Dismiss all overlays",
      "3. Trigger a level up via spinning",
      "4. Observe the full level up sequence",
      "5. Wait 10 seconds after the level transition completes",
      "6. Check whether max bet or reward factor toasters still appear independently"
    ],
    expectedResult: "Level up toaster does not appear. XP bar and level counter update silently. No crash or error occurs. Autospin is not interrupted. Other eligible toasters still appear on their own schedules.",
    negativeScenario: "Toaster appears despite toggle being false. Game crashes when toaster is suppressed. All other notification types are also suppressed when only level_up toggle is false. Silent failure with no indication that the level up occurred.",
    linkedBugRisk: "Remote config toggle not evaluated at queue construction time; hardcoded true value used instead of fetched config"
  },
  {
    folder: "Config / Feature Flag Tests", id: "TC_035", priority: "P1", type: "EOS", testingMode: "Manual",
    name: "notif_min_level_level_up Boundary — Exact Min Shows, One Below Does Not",
    description: "Off-by-one boundary test. If min_level is set to 10, levelling up TO 10 must NOT show the toaster. Levelling up to 11 (past the boundary) MUST show it. This is the most commonly misimplemented edge case in level-gated notification systems.",
    precondition: "Remote config: notif_min_level_level_up=10, two test accounts — one at level 9, one at level 10 — both in the test variant",
    steps: [
      "1. Account at level 9: trigger level up to level 10. Observe whether toaster appears.",
      "2. Account at level 10: trigger level up to level 11. Observe whether toaster appears.",
      "3. With default config (min_level=1): trigger level up from level 1. Confirm baseline works."
    ],
    expectedResult: "Level 9→10 (reaching minimum, not past it): toaster does NOT appear. Level 10→11 (past minimum): toaster DOES appear. Default config (min=1): toaster appears from level 1 upward.",
    negativeScenario: "Off-by-one: toaster fires at 9→10 when it should not. Toaster suppressed at 10→11 when it should appear. Boundary uses strict greater-than (>) instead of greater-than-or-equal (>=).",
    linkedBugRisk: "Classic >= vs > boundary error in level gate evaluation; systematic off-by-one across all level-gated config variables"
  },
  {
    folder: "Edge Case & Interruption Tests", id: "TC_041", priority: "P1", type: "Edge Case", testingMode: "Manual",
    name: "Toaster Visible During Bonus Game Entry — Not Reshown on Return",
    description: "If a player enters bonus game or free spins while a level up toaster is currently displayed, that toaster is considered 'viewed' and must not reappear when the player returns to the base game. Queued toasters (not yet shown) must still appear on return.",
    precondition: "Account capable of triggering a bonus game shortly after a level up, notif_duration_level_up set to 5s (extended for test timing), stable test environment",
    steps: [
      "1. Launch game, dismiss all overlays",
      "2. Position account 1 spin from a level up",
      "3. Trigger the level up — level up toaster appears on screen",
      "4. While toaster is still visible, land a bonus game trigger",
      "5. Allow the bonus game to run to completion",
      "6. Return to the base game screen",
      "7. Observe whether the level up toaster reappears"
    ],
    expectedResult: "After returning from bonus game, the level up toaster does not reappear — it was marked as viewed. Any toasters that were queued but not yet shown at the time of entry DO appear correctly on return.",
    negativeScenario: "Level up toaster reappears after returning from bonus game (double-show). The entire notification queue replays from the beginning. Queued toasters that should appear on return are suppressed instead.",
    linkedBugRisk: "Toaster view-state not persisted across screen transitions; queue resume logic replaying from start instead of continuing from last unshown item"
  },
  {
    folder: "Spam & Stress Tests", id: "TC_048", priority: "P1", type: "Spam", testingMode: "Manual",
    name: "5 Rapid Back-to-Back Level Ups at Max Bet — Queue Integrity Under Speed",
    description: "Forces 5 consecutive level ups as fast as possible at maximum bet. Each new level up should cancel the previous queue and start fresh. Validates no crash, no simultaneous toasters, no frozen queue, and no performance degradation.",
    precondition: "Large coin balance, max bet selected, account near a level up boundary, all remote config toggles enabled, device performance monitoring active",
    steps: [
      "1. Launch game, dismiss all overlays",
      "2. Select maximum bet",
      "3. Begin spinning at maximum speed — no pauses between spins",
      "4. Trigger 5 consecutive level ups with minimal time between each",
      "5. After all 5 level ups, allow the final notification queue to complete",
      "6. Monitor game performance during the sequence",
      "7. Check game state after all notifications clear"
    ],
    expectedResult: "Game does not crash. No two toasters appear simultaneously. After each level up, the previous queue is discarded and the new queue begins. Final level's toaster sequence completes with accurate values. Game remains responsive throughout. No residual UI elements remain after the last queue completes.",
    negativeScenario: "Game crashes during rapid level up sequence. Multiple toasters appear simultaneously. Queue freezes with no further toasters. All 5 levels worth of toasters stack and play in full. Frame rate drops significantly. A stale toaster from an earlier level appears after a later one triggers.",
    linkedBugRisk: "Memory leak in notification queue object lifecycle; race condition in queue replacement when new level event fires during active toaster display"
  },
  {
    folder: "UI & Art Tests", id: "TC_055", priority: "P2", type: "UI", testingMode: "Manual",
    name: "Max Bet Toaster — Position Anchored to Bet Selector on Portrait Layout",
    description: "The max bet toaster must appear adjacent to the bet selector UI element (bottom area), not at the top where legacy notifications appeared. This positional requirement must hold on portrait (vertical) machine layouts which have different UI proportions.",
    precondition: "Test device running a portrait orientation machine, account at a level where max bet increases on level up, notif_toggle_max_bet=true",
    steps: [
      "1. Launch game on a portrait orientation machine",
      "2. Dismiss all overlays, confirm portrait layout is active",
      "3. Note the position of the bet selector UI element on screen",
      "4. Trigger a level up that causes a max bet increase",
      "5. Observe the position of the max bet toaster",
      "6. Check for pulsing glow animation on the bet increase button",
      "7. Verify auto-dismiss after 5 seconds"
    ],
    expectedResult: "Max bet toaster appears in the bottom area of the screen, adjacent to the bet selector. Content shows the correct new max bet value. Pulsing glow activates on the bet increase button. Toaster does not overlap the reel area. Auto-dismisses after 5 seconds.",
    negativeScenario: "Toaster appears at the top of screen (old position). Toaster overlaps the reel in portrait proportions. Toaster is clipped or off-screen in portrait layout. Pulsing glow does not appear. Toaster shows wrong max bet value.",
    linkedBugRisk: "Position coordinates hardcoded from landscape layout; bet selector element reference returning null in portrait mode causing fallback to default top position"
  },
  {
    folder: "Regression Tests", id: "TC_062", priority: "P1", type: "Regression", testingMode: "Manual",
    name: "Autospin Not Interrupted by Any Notification During Full Level Up Sequence",
    description: "Core regression test for the entire feature. Removed dialogs previously interrupted autospin. The replacement toaster system must not interrupt autospin under any circumstance — level up, max bet, reward factor, and machine unlock toasters must all appear and dismiss without stopping spins.",
    precondition: "Autospin enabled, account near a level where multiple toasters can be triggered (level up + max bet + reward factor), all remote config toggles enabled",
    steps: [
      "1. Launch game, dismiss all overlays",
      "2. Enable autospin — confirm spin counter is incrementing",
      "3. Allow autospin to run through a level up triggering the full notification queue",
      "4. Observe autospin behaviour during each toaster as it appears and dismisses",
      "5. Allow all toasters to complete and auto-dismiss",
      "6. Confirm autospin continues normally after all notifications have cleared"
    ],
    expectedResult: "Autospin continues without any pause during the level up toaster, max bet toaster, and reward factor toaster. Spin counter increments continuously. No manual action required. Autospin still active after all toasters have dismissed.",
    negativeScenario: "Autospin pauses when any toaster appears. Player must manually restart autospin after notifications. Spin counter freezes during toaster display. A spin is swallowed (started but result not returned) during a toaster transition.",
    linkedBugRisk: "Autospin interrupt call not removed from toaster show/hide lifecycle; pause event still bound to notification display event"
  },
  {
    folder: "Edge Case & Interruption Tests", id: "TC_071", priority: "P2", type: "Edge Case", testingMode: "Manual",
    name: "Multiple Reward Factor Changes in One Session — Only Most Recent RTL Dialog Shown",
    description: "If a player earns two reward factor changes without visiting the lobby between them, only the most recent RTL dialog should appear on lobby return. The earlier dialog must be silently discarded. Common failure point in queued dialog systems.",
    precondition: "Account that can trigger two reward factor milestones in one session without returning to lobby, test build with configurable trigger levels",
    steps: [
      "1. Launch game in a machine, dismiss all overlays",
      "2. Trigger the first reward factor milestone",
      "3. Do NOT return to lobby",
      "4. Trigger the second reward factor milestone",
      "5. Return to the lobby",
      "6. Observe which RTL dialog appears and how many times"
    ],
    expectedResult: "Exactly one RTL dialog appears on lobby return. The dialog reflects the most recent reward factor change. The earlier dialog is silently discarded. Dialog is manually dismissible. Does not reappear after dismissal.",
    negativeScenario: "Both dialogs appear in sequence — player must dismiss twice. Earlier dialog appears first with outdated values. Both dialogs appear simultaneously. Neither dialog appears. Dialog shows incorrect reward percentage.",
    linkedBugRisk: "RTL dialog queue implemented as append-list instead of replace-latest; deduplication step missing or applied at wrong point in session lifecycle"
  },
];

// ─── MOCK BUG REPORT ─────────────────────────────────────────────────────────
export const MOCK_BUG = {
  bugId: "BUG_SLOT_047",
  title: "Max Bet Toaster Renders at Top of Screen Instead of Adjacent to Bet Selector",
  severity: "High",
  priority: "P2",
  component: "Level Up Flow > Max Bet Increase Toaster > Position",
  environment: "iPhone 14 Pro / iOS 17.2 / Build 3.8.0 / Remote config test variant active / Wi-Fi",
  summary: "The max bet toaster appears at the top-left of the game screen instead of in the bottom area adjacent to the bet selector UI element.",
  stepsToReproduce: [
    "1. Launch the game on iPhone 14 Pro (iOS 17.2, build 3.8.0)",
    "2. Dismiss MOTD and daily bonus overlays",
    "3. Confirm remote config test variant is active (notif_toggle_max_bet=true)",
    "4. Set account to a level where max bet increases on next level up",
    "5. Spin until level up occurs and max bet increase is triggered",
    "6. Observe the screen position of the max bet toaster when it appears",
  ],
  actualResult: "Max bet toaster appears at the top-left of the game screen, overlapping the player level indicator. The bet selector area has no toaster and no pulsing glow animation on the bet increase button.",
  expectedResult: "Max bet toaster should appear adjacent to the bet selector element in the bottom area of the screen. Pulsing glow animation should activate on the bet increase button for approximately 3 seconds.",
  frequency: "Always — 100% reproduction rate on affected build across 5 test runs",
  workaround: "None — toaster appears but provides no contextual link to the bet selector",
  rootCauseSuspicion: "Toaster anchor position likely a hardcoded coordinate from the previous notification system rather than dynamically reading the bet selector element's runtime position.",
  attachmentsNeeded: "Screen recording of the full level up sequence showing toaster at wrong position. Annotated screenshot marking correct expected position vs actual position.",
  testCaseGap: true,
  gapExplanation: "TC_055 covers portrait layout position verification but does not include an explicit position assertion for landscape layout. A landscape-specific position test case is missing from the suite.",
  suggestedTC: {
    folder: "UI & Art Tests",
    id: "TC_GAP_001",
    name: "Max Bet Toaster — Position Anchored to Bet Selector on Landscape Layout",
    priority: "P1",
    type: "UI",
    description: "Verifies the max bet toaster appears in the bottom area of the screen adjacent to the bet selector on standard landscape machine layout — not at the top where legacy notification elements appeared.",
    steps: [
      "1. Launch game on a standard landscape orientation machine",
      "2. Trigger a level up that causes a max bet increase",
      "3. Verify toaster Y position is within the bottom 30% of the visible game canvas",
      "4. Verify toaster is horizontally adjacent to the bet selector element",
      "5. Verify pulsing glow animation activates on the bet increase button"
    ],
    expectedResult: "Toaster anchored to bet selector in bottom section of screen. Y position in bottom 30% of canvas. Pulsing glow active on bet button. Not positioned at top of screen.",
    negativeScenario: "Toaster appears at top-left (legacy position). Toaster has no spatial relationship to the bet selector. Pulsing glow does not activate."
  }
};

// ─── COVERAGE DATA ────────────────────────────────────────────────────────────
export const COVERAGE_DATA = {
  totalCases: 83,
  p1: 32,
  p2: 30,
  p3: 21,
  coveragePct: 89,
  estimatedDays: 5.5,
  gapAlerts: 2,
  folders: [
    { name: "Functional Tests",               count: 14, coverage: 95 },
    { name: "Negative Tests",                 count: 11, coverage: 100 },
    { name: "Spam & Stress Tests",            count: 7,  coverage: 85 },
    { name: "UI & Art Tests",                 count: 10, coverage: 88 },
    { name: "Queue & Priority Tests",         count: 12, coverage: 92 },
    { name: "Config / Feature Flag Tests",    count: 13, coverage: 94 },
    { name: "Edge Case & Interruption Tests", count: 10, coverage: 88 },
    { name: "Regression Tests",               count: 8,  coverage: 100 },
    { name: "Portrait Machine Tests",         count: 6,  coverage: 80 },
    { name: "Audio Tests",                    count: 4,  coverage: 75 },
  ]
};
