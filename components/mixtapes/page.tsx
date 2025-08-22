// components/mixtapes/FeaturedMixtapes.tsx

import { GridContainer } from 'components/grid/Container';
import { GridItem } from 'components/grid/Item';
import MixtapeCard from 'components/mixtapes/MixtapeCard';
import { getMixtapes } from 'lib/data/mixtapes';

export default async function FeaturedMixtapes() {
  try {
    const mixtapes = await getMixtapes('recent', 48);

    if (!mixtapes?.length) return null;

    return (
      <GridContainer>
        {mixtapes.map((mixtape, index) => {
          if (!mixtape || !mixtape._id) {
            return null;
          }

          return (
            <GridItem
              key={`mixtape-${mixtape.id || mixtape._id}-${index}`}
              type="mixtape"
              id={mixtape.id || mixtape._id}
              inStock={true}
              category={mixtape.genre}
              featured={mixtape.featured}
            >
              <MixtapeCard mixtape={mixtape as any} />
            </GridItem>
          );
        })}
      </GridContainer>
    );
  } catch (error) {
    return null;
  }
}
