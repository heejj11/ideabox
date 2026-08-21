import { useEffect, useState } from 'react';
import { useIdeaImageQuery } from './queries';

interface IdeaImageProps {
  fileId: string;
  alt: string;
}

export function IdeaImage({ fileId, alt }: IdeaImageProps) {
  const imageQuery = useIdeaImageQuery(fileId);
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    if (!imageQuery.data) return;
    const objectUrl = URL.createObjectURL(imageQuery.data);
    setSource(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageQuery.data]);

  if (imageQuery.isPending) {
    return <div className="image-placeholder" role="status">이미지 불러오는 중…</div>;
  }

  if (imageQuery.isError || !source) {
    return <div className="image-placeholder image-placeholder--error">이미지를 불러오지 못했어요.</div>;
  }

  return <img src={source} alt={alt} loading="lazy" />;
}
