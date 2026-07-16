export function normalizeFilterQuery<T extends Record<string, any>>(
  query?: Record<string, any> | null,
): T {
  if (!query || typeof query !== 'object') {
    return {} as T;
  }

  const normalized: Record<string, any> = {};

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    const normalizedKey = key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
    const parsedValue = parseQueryValue(value);

    if (normalizedKey === 'tags') {
      const tags = Array.isArray(parsedValue)
        ? parsedValue
        : typeof parsedValue === 'string'
          ? parsedValue.split(',')
          : [parsedValue];

      normalized[normalizedKey] = tags
        .flatMap((tag: any) => (typeof tag === 'string' ? tag.split(',') : []))
        .map((tag: string) => tag.trim())
        .filter(Boolean);
      continue;
    }

    normalized[normalizedKey] = parsedValue;
  }

  return normalized as T;
}

function parseQueryValue(value: any): any {
  if (Array.isArray(value)) {
    return value.map((item) => parseQueryValue(item));
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();

  if (trimmed === '') {
    return undefined;
  }

  if (/^(true|false)$/i.test(trimmed)) {
    return trimmed.toLowerCase() === 'true';
  }

  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  return trimmed;
}
