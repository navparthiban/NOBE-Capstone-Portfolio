export function getLinkProps(item) {
  return {
    href: item.url,
    ...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
  }
}
