/**
 * 8pt-grid spacing tokens for mobile screens. Single source of truth
 * for vertical/horizontal rhythm — Apple HIG + Material Design 8pt
 * grid convention. Tweak here to adjust the whole app at once.
 */
export const SPACING = {
  // Base unit
  unit: 8,

  // Screen
  screenH: 16, // horizontal screen edge

  // Header group
  headerTop: 8, // after safe area
  headerSubtitleGap: 4, // title -> subtitle (within group)
  headerToTabs: 24, // header group -> tab strip

  // Tab strip
  tabPadV: 12, // vertical padding inside each tab pressable
  tabsToContent: 16, // tab strip -> tab content

  // Sub-controls (filter row, list/calendar toggle)
  subControlPadV: 8,
  subControlBottom: 16, // sub-control row -> first content

  // List items
  cardGap: 12, // between cards
  cardPad: 12, // inside card
  cardTitleToMeta: 4, // title -> meta within card

  // Calendar view
  calendarToDayHeader: 16,
  dayHeaderToContent: 8,
  emptyStateIconToText: 8,

  // FAB
  fabBottom: 24,
  fabRight: 24,
} as const;
