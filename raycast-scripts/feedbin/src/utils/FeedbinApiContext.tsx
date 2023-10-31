import { ReactNode, createContext, useContext, useMemo } from "react";
import invariant from "tiny-invariant";
import {
  Subscription,
  useIcons,
  useStarredEntries,
  useStarredEntriesIds,
  useSubscriptions,
  useUnreadEntriesIds,
} from "./api";

type FeedbinApiContext = {
  subscriptions: ReturnType<typeof useSubscriptions>;
  icons: ReturnType<typeof useIcons>;
  starredEntries: ReturnType<typeof useStarredEntries>;
  starredEntriesIds: ReturnType<typeof useStarredEntriesIds>;
  unreadEntriesIds: ReturnType<typeof useUnreadEntriesIds>;
  iconMap: Record<string, string>;
  subscriptionMap: Record<number, Subscription>;
  starredEntriesIdsSet: Set<number>;
  unreadEntriesSet: Set<number>;
  isLoading: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Context = createContext<FeedbinApiContext>(undefined as any);

export const FeedbinApiContextProvider = (props: { children?: ReactNode }) => {
  const subscriptions = useSubscriptions();
  const starredEntries = useStarredEntries();
  const icons = useIcons();
  const starredEntriesIds = useStarredEntriesIds();
  const unreadEntriesIds = useUnreadEntriesIds();
  const isLoading =
    subscriptions.isLoading ||
    starredEntries.isLoading ||
    icons.isLoading ||
    starredEntriesIds.isLoading ||
    unreadEntriesIds.isLoading;

  const subscriptionMap = useMemo(
    () =>
      subscriptions.data
        ? subscriptions.data.reduce<Record<number, Subscription>>(
            (acc, sub) => ({ ...acc, [sub.feed_id]: sub }),
            {},
          )
        : {},
    [subscriptions.data],
  );
  const iconMap = useMemo(
    () =>
      icons.data
        ? icons.data.reduce<Record<string, string>>(
            (acc, icon) => ({ ...acc, [icon.host]: icon.url }),
            {},
          )
        : {},
    [icons.data],
  );
  const starredEntriesIdsSet = useMemo(
    () => new Set(starredEntriesIds.data),
    [starredEntriesIds.data],
  );

  const unreadEntriesSet = useMemo(
    () => new Set(unreadEntriesIds.data),
    [unreadEntriesIds.data],
  );

  const api: FeedbinApiContext = {
    subscriptions,
    subscriptionMap,
    icons,
    iconMap,
    starredEntries,
    starredEntriesIds,
    starredEntriesIdsSet,
    unreadEntriesIds,
    unreadEntriesSet,
    isLoading,
  };

  return <Context.Provider value={api}>{props.children}</Context.Provider>;
};

export const useFeedbinApiContext = () => {
  const api = useContext(Context);
  invariant(api, "usecontext must be used within a ContextProvider");
  return api;
};
