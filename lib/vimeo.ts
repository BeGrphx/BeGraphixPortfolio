export function getVimeoEmbedUrl(url: string): string | null {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return `https://player.vimeo.com/video/${match[1]}?autoplay=0&title=0&byline=0&portrait=0`;
    }
  }

  return null;
}
