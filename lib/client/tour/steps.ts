/**
 * Onboarding tour content.
 *
 * Steps are plain data so the flow can be reordered or extended without
 * touching the overlay. Each one names the route it belongs to and a CSS
 * selector for the element to spotlight; the provider handles navigating
 * there and waiting for the anchor to mount.
 *
 * The route order here is the path to first value: understand the wallet →
 * fund it → get your keys → run a check → find the result.
 */

export type TourPlacement = "top" | "bottom" | "left" | "right";

export interface TourStep {
  id: string;
  /** Route the step lives on. The provider navigates here first. */
  route: string;
  /** Element to spotlight. Omit for a centred card with no anchor. */
  anchor?: string;
  /**
   * Anchor to use below the `lg` breakpoint, where the sidebar is not
   * rendered. Falls back to `anchor` when absent.
   */
  mobileAnchor?: string;
  /** Skipped entirely below `lg` — for UI that doesn't exist there. */
  desktopOnly?: boolean;
  title: string;
  body: string;
  placement?: TourPlacement;
}

/**
 * Bumping this re-runs the tour for everyone, including users who already
 * finished the previous version. Only bump for a genuine flow change.
 */
export const TOUR_VERSION = 1;

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    route: "/dashboard",
    title: "Welcome to SprintCheck",
    body: "A quick tour of where everything lives — about 60 seconds. You can leave at any point and pick it up later from the account menu.",
  },
  {
    id: "nav",
    route: "/dashboard",
    anchor: '[data-tour="sidebar-nav"]',
    mobileAnchor: '[data-tour="mobile-nav"]',
    placement: "right",
    title: "Getting around",
    body: "Verifications, history, billing and your API keys all live here.",
  },
  {
    id: "balance",
    route: "/dashboard",
    anchor: '[data-tour="balance"]',
    placement: "bottom",
    title: "Your wallet",
    body: "Every verification is charged to this balance, and only successful checks are billed.",
  },
  {
    id: "topup",
    route: "/billing",
    anchor: '[data-tour="topup"]',
    placement: "left",
    title: "Adding funds",
    body: "Top up by transferring to your dedicated virtual account — the balance updates on its own.",
  },
  {
    id: "keys",
    route: "/developers",
    anchor: '[data-tour="api-keys"]',
    placement: "top",
    title: "Your API credentials",
    body: "Your live and test keys, plus the webhook URL we post results to. Keep the encryption key private — it signs your requests.",
  },
  {
    id: "verify",
    route: "/verification",
    anchor: '[data-tour="verification-form"]',
    placement: "bottom",
    title: "Running a check",
    body: "Look up a business by name, RC number or TIN without writing any code. Handy for testing before you integrate.",
  },
  {
    id: "history",
    route: "/history",
    anchor: '[data-tour="history-table"]',
    placement: "top",
    title: "Every result, logged",
    body: "Each check lands here with its status and timestamp. Billing keeps the matching wallet entries.",
  },
  {
    id: "done",
    route: "/dashboard",
    title: "That's the tour",
    body: "Fund your wallet and grab your API keys when you're ready. The docs cover the full API, and you can replay this tour from the account menu.",
  },
];
