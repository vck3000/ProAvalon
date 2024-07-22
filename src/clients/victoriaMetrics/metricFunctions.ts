export function generateLabelCombinations(
  labelOptions: Record<string, Set<string>>,
): Record<string, string>[] {
  let labelCombinations: Record<string, string>[] = [{}];

  Object.keys(labelOptions).forEach((labelName) => {
    // Get current label options
    const options = Array.from(labelOptions[labelName]);

    labelCombinations = labelCombinations.flatMap((combination) =>
      options.map((option) => ({
        ...combination,
        [labelName]: option,
      })),
    );
  });

  return labelCombinations;
}

export function isValidLabelCombination(
  labelOptions: Record<string, Set<string>>,
  labelCombination: Record<string, string>,
): boolean {
  // Key size does not match
  if (
    Object.keys(labelCombination).length !== Object.keys(labelOptions).length
  ) {
    return false;
  }

  for (const labelName in labelCombination) {
    // label name is not in config
    if (!(labelName in labelOptions)) {
      return false;
    }

    // Option not present under the label name
    if (!labelOptions[labelName].has(labelCombination[labelName])) {
      return false;
    }
  }

  return true;
}
