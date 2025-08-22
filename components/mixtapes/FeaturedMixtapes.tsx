// components/mixtapes/FeaturedMixtapes.tsx
// Updated to accept preloaded data

import { GridContainer } from 'components/grid/Container';
import { GridItem } from 'components/grid/Item';
import dynamic from 'next/dynamic';
const MixtapeCard = dynamic(() => import('components/mixtapes/MixtapeCard'));
import { getMixtapes } from 'lib/data/mixtapes';

// Add interface for props - using any[] since I don't have the exact mixtape type
interface FeaturedMixtapesProps {
  preloadedData?: any[];
}

export default async function FeaturedMixtapes({ preloadedData }: FeaturedMixtapesProps = {}) {
  try {
    let mixtapes: any[];

    if (preloadedData && preloadedData.length > 0) {
      mixtapes = preloadedData;
    } else {
      mixtapes = await getMixtapes('recent', 12);
    }

    if (!mixtapes?.length) {
      return null;
    }

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
              <MixtapeCard mixtape={mixtape} />
            </GridItem>
          );
        })}
      </GridContainer>
    );
  } catch (error) {
    return null;
  }
}
