export const parseJSON = (data: string) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
};
