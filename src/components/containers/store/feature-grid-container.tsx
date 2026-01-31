import FeatureGridItem from "@/components/base/common/feature-grid-item";
import { features } from "@/data/feature";
import { gridCellBorderClasses } from "@/lib/utils";

export default function FeatureGridContainer() {
  const columns2 = 2;
  const columns3 = 3;

  return (
    <div className="grid @4xl:grid-cols-2 @6xl:grid-cols-3 grid-cols-1">
      {features.map((feature, index) => (
        <FeatureGridItem
          key={feature.title}
          title={feature.title}
          description={feature.description}
          icon={<feature.icon />}
          outlineIcon={<feature.outlineIcon className="text-border" />}
          className={gridCellBorderClasses(index, columns2, columns3, true)}
        />
      ))}
    </div>
  );
}
