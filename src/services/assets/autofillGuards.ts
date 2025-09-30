export const shouldAutofillAsset = (existingImage?: string | null): boolean => {
  if (existingImage === undefined || existingImage === null) {
    return true;
  }

  if (typeof existingImage === 'string') {
    return existingImage.trim().length === 0;
  }

  return true;
};
