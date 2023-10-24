import { List } from "@raycast/api";
import { useSubscriptions } from "./utils/api";

export default function SubscriptionsCommand(): JSX.Element {
  const { data, isLoading } = useSubscriptions();

  return (
    <List isLoading={isLoading}>
      {data?.map((sub) => <List.Item key={sub.id} title={sub.title} subtitle={sub.site_url} />)}
    </List>
  );
}
