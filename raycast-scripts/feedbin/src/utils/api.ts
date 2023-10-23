import { getPreferenceValues } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useMemo } from "react";
import fetch from "node-fetch";

const API_ROOT = "https://api.feedbin.com";

export interface Entry {
  id: number;
  feed_id: number;
  summary: string;
  title: string | null;
  author: string | null;
  content: string | null;
  url: string;
  extracted_content_url: string;
  published: string;
  created_at: string;
}

export interface Subscription {
  id: number;
  created_at: string;
  feed_id: number;
  title: string;
  feed_url: string;
  site_url: string;
}

function getHeaders() {
  const { email, password } = getPreferenceValues();
  return {
    Authorization: "Basic " + btoa(`${email}:${password}`),
  };
}

type EntriesParams = {
  mode?: "extended";
  read?: "false";
};

export function useEntries(params: EntriesParams = {}) {
  const searchParams = new URLSearchParams(params);
  return useFetch<Entry[]>(`${API_ROOT}/v2/entries.json?${searchParams}`, {
    method: "GET",
    headers: getHeaders(),
  });
}

export function useSubscriptions() {
  return useFetch<Subscription[]>(`${API_ROOT}/v2/subscriptions.json`, {
    method: "GET",
    headers: getHeaders(),
  });
}

export function useSubscriptionMap() {
  const { isLoading, data } = useSubscriptions();
  const subscriptionMap = useMemo(
    () => (data ? data.reduce<Record<number, Subscription>>((acc, sub) => ({ ...acc, [sub.feed_id]: sub }), {}) : {}),
    [data],
  );

  return {
    isLoading,
    data: subscriptionMap,
  };
}

export function markAsRead(...entryIds: number[]) {
  const del = fetch(`https://feedbin.com/entries/${entryIds[0]}/mark_as_read`, {
    method: "POST",
    headers: getHeaders(),
  });

  return del.then(async (res) => {
    const clone = await res.clone();

    console.log(res.status, await res.json());

    return clone;
  });
}
