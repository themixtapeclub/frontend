import OpengraphImage from 'components/ui/opengraph-image';
import { getCategory } from "lib/commerce/swell/client";

export const runtime = 'edge';

export default async function Image({ params }: { params: { collection: string } }) {
  const collection = await getCategory(params.collection);
  const title = collection?.name;

  return await OpengraphImage({ title });
}
