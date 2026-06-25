import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  TAB_BAR_CONTAINER_HEIGHT,
  TAB_BAR_WRAPPER_MARGIN_TOP,
  TAB_BAR_MIN_BOTTOM_INSET,
  TAB_BAR_BOTTOM_GAP,
} from "../components/ui/SPTabBar";

/**
 * Returns the total on-screen footprint of the floating SPTabBar
 * (its own height + the top margin above it + the safe-area-aware
 * bottom gap below it), in the same units SPTabBar itself uses to
 * lay out.
 *
 * Since SPTabBar is now position:absolute over screen content,
 * any scrollable screen needs to reserve this much space at the
 * bottom (e.g. via contentContainerStyle paddingBottom) or its
 * last items will render underneath the bar.
 *
 * This mirrors SPTabBar's own internal math exactly — if SPTabBar's
 * layout numbers change, update the constants it exports and this
 * hook stays correct automatically.
 */
export function useTabBarHeight(): number {
  const insets = useSafeAreaInsets();
  const bottomInset =
    Math.max(insets.bottom, TAB_BAR_MIN_BOTTOM_INSET) + TAB_BAR_BOTTOM_GAP;

  return TAB_BAR_CONTAINER_HEIGHT + TAB_BAR_WRAPPER_MARGIN_TOP + bottomInset;
}

export default useTabBarHeight;
