import PlayerClient from '../PlayerClient';

export default async function PlayerUuidPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  return <PlayerClient uuid={uuid} />;
}
